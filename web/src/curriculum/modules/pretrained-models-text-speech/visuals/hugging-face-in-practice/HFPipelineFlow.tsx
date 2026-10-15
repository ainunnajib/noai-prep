import { useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, usePlayer, PlayerControls, Bars } from '../../../../../kit'
import { SENT, NER, SUMM } from './hfData'
import s from './hf.module.css'

/*
  What happens inside pipeline(...)(text): tokenizer → model → post-processing, for three tasks, with the real
  numbers each stage produces (see hfData.ts). Step through the stages; switch task and example.
*/

type Task = 'sent' | 'ner' | 'summ'
const STAGES = ['text', 'tokenizer', 'model', 'post-process']

const isSpecial = (t: string) => /^\[(CLS|SEP|PAD)\]$|^<\/?s>$|^<pad>$/.test(t)
const entClass = (lab: string) => (lab === 'O' ? s.entO : lab.endsWith('PER') ? s.entPER : lab.endsWith('LOC') ? s.entLOC : lab.endsWith('ORG') ? s.entORG : s.entMISC)

function Units({ tokens, ids, mask = true, max }: { tokens: string[]; ids: number[]; mask?: boolean; max?: number }) {
  const n = max ? Math.min(max, tokens.length) : tokens.length
  return (
    <div className={s.units} role="list" aria-label="Tokens, their ids and the attention mask">
      {tokens.slice(0, n).map((t, i) => (
        <div key={i} className={s.unit} role="listitem">
          <span className={`${s.uTok} ${isSpecial(t) ? s.uSpecial : ''}`}>{t}</span>
          <span className={s.uId}>{ids[i]}</span>
          {mask && <span className={s.uMask}>1</span>}
        </div>
      ))}
      {max && tokens.length > max && (
        <div className={s.unit} role="listitem">
          <span className={s.uTok}>…</span>
          <span className={s.uId}>+{tokens.length - max} more</span>
        </div>
      )}
    </div>
  )
}

function Code({ lines }: { lines: string[] }) {
  return (
    <pre className={s.code} aria-label="Code for this stage">
      {lines.map((l, i) => {
        const k = l.indexOf('#')
        return (
          <div key={i}>
            {k >= 0 ? (
              <>
                {l.slice(0, k)}
                <span className={s.codeCmt}>{l.slice(k)}</span>
              </>
            ) : (
              l
            )}
          </div>
        )
      })}
    </pre>
  )
}

export default function HFPipelineFlow() {
  const [task, setTask] = useState<Task>('sent')
  const [exIdx, setExIdx] = useState(0)
  const player = usePlayer({ steps: STAGES.length, interval: 1800 })
  const st = player.step

  const examples = task === 'sent' ? SENT.examples.map((e) => e.text) : task === 'ner' ? NER.examples.map((e) => e.text) : [SUMM.text]
  const ei = Math.min(exIdx, examples.length - 1)

  let code: string[] = []
  let body: ReactNode = null
  let note: ReactNode = null

  if (task === 'sent') {
    const e = SENT.examples[ei]
    const top = e.probs[0] > e.probs[1] ? 0 : 1
    if (st === 0) {
      code = ['from transformers import pipeline', 'clf = pipeline("sentiment-analysis",', `               model="${SENT.model}")`, `clf("${e.text}")`]
      body = <blockquote className={s.hint} style={{ margin: 0, fontSize: '1rem' }}>"{e.text}"</blockquote>
      note = <>One line of code. Inside it are three stages: press <b>Next</b> to open each one.</>
    } else if (st === 1) {
      code = ['tok = AutoTokenizer.from_pretrained(name)', 'enc = tok(text, return_tensors="pt")   # input_ids + attention_mask']
      body = (
        <>
          <div className={s.rowLegend}>
            <span>top: token</span>
            <span>middle: input_ids</span>
            <span>bottom: attention_mask</span>
          </div>
          <Units tokens={e.tokens} ids={e.ids} />
        </>
      )
      note = (
        <>
          The tokenizer splits the text into {e.tokens.length} tokens, adds <code>[CLS]</code> (id 101) and <code>[SEP]</code> (id 102), and replaces every
          token by its row number in the 30,522-token vocabulary. The attention mask is 1 for every real token.
        </>
      )
    } else if (st === 2) {
      code = ['model = AutoModelForSequenceClassification.from_pretrained(name)', 'logits = model(**enc).logits          # shape (1, 2)']
      body = (
        <Bars
          ariaLabel="Logits"
          format={(v) => v.toFixed(2)}
          data={e.logits.map((v, k) => ({ label: `${k}: ${SENT.labels[String(k)]}`, value: v, color: v >= 0 ? 'var(--viz-3)' : 'var(--viz-4)', strong: k === top }))}
        />
      )
      note = (
        <>
          The model returns <b>logits</b>: one raw score per class, here [{e.logits.map((v) => v.toFixed(2)).join(', ')}]. They are not probabilities yet (they
          can be negative and do not add up to 1).
        </>
      )
    } else {
      code = ['probs = logits.softmax(dim=-1)', 'k = probs.argmax(dim=-1).item()', 'label = model.config.id2label[k]']
      body = (
        <>
          <Bars ariaLabel="Probabilities" max={1} format={(v) => v.toFixed(4)} data={e.probs.map((v, k) => ({ label: SENT.labels[String(k)], value: v, color: 'var(--viz-1)', strong: k === top }))} />
          <pre className={s.result}>{`argmax = ${top}  →  id2label[${top}] = '${SENT.labels[String(top)]}'\n[{'label': '${e.label}', 'score': ${e.score.toFixed(4)}}]`}</pre>
        </>
      )
      note = <>Softmax turns the logits into probabilities, argmax picks the biggest, and <code>id2label</code> turns the class number into a name. That dictionary is exactly what the pipeline returns.</>
    }
  } else if (task === 'ner') {
    const e = NER.examples[ei]
    if (st === 0) {
      code = ['from transformers import pipeline', `ner = pipeline("ner", model="${NER.model}",`, '               aggregation_strategy="simple")', `ner("${e.text}")`]
      body = <blockquote className={s.hint} style={{ margin: 0, fontSize: '1rem' }}>"{e.text}"</blockquote>
      note = <>Named-entity recognition (NER) labels every token as a person (PER), place (LOC), organisation (ORG), other name (MISC) or nothing (O).</>
    } else if (st === 1) {
      code = ['tok = AutoTokenizer.from_pretrained(name)', 'enc = tok(text, return_tensors="pt")']
      body = (
        <>
          <div className={s.rowLegend}>
            <span>top: token</span>
            <span>middle: input_ids</span>
            <span>bottom: attention_mask</span>
          </div>
          <Units tokens={e.tokens} ids={e.ids} />
        </>
      )
      const cut = e.tokens.findIndex((_, i) => e.tokens[i + 1]?.startsWith('##'))
      note = (
        <>
          This model keeps capital letters (they are a strong clue for names) and splits rare words into pieces
          {cut >= 0 ? (
            <>
              , such as <code>{e.tokens[cut]}</code> + <code>{e.tokens[cut + 1]}</code>
            </>
          ) : null}
          .
        </>
      )
    } else if (st === 2) {
      const labs = Object.keys(NER.labels).map((k) => NER.labels[k])
      const cell = 26
      code = ['model = AutoModelForTokenClassification.from_pretrained(name)', `logits = model(**enc).logits   # shape (1, ${e.shape[0]}, ${e.shape[1]})`]
      body = (
        <div style={{ display: 'grid', justifyItems: 'center', width: '100%' }}>
          <div className={s.heat} style={{ gridTemplateColumns: `minmax(3.2rem, max-content) repeat(${labs.length}, ${cell}px)` }} role="img" aria-label="Logits: one row per token, one column per label">
            <span />
            {labs.map((l) => (
              <span key={l} className={s.hColLab} title={l}>
                {l}
              </span>
            ))}
            {e.tokens.map((t, i) => {
              const row = e.logits[i]
              const mx = Math.max(...row)
              const mn = Math.min(...row)
              return [
                <span key={`l${i}`} className={s.hLab} style={{ textAlign: 'right', paddingRight: 4 }}>
                  {t}
                </span>,
                ...row.map((v, k) => (
                  <span
                    key={`${i}-${k}`}
                    className={`${s.hCell} ${v === mx ? s.hCellTop : ''}`}
                    style={{ background: `color-mix(in srgb, var(--viz-1) ${Math.round(4 + (82 * (v - mn)) / Math.max(1e-6, mx - mn))}%, var(--surface))` }}
                    title={`${t} / ${labs[k]}: ${v}`}
                  />
                )),
              ]
            })}
          </div>
        </div>
      )
      note = (
        <>
          A token-classification head gives <b>every token</b> its own 9 scores, one per label (columns: O, B-MISC, I-MISC, B-PER, I-PER, B-ORG, I-ORG, B-LOC,
          I-LOC; B = beginning of a name, I = inside it). The stronger the colour, the higher the score; the outlined cell is each row's winner.
        </>
      )
    } else {
      code = ['ids = logits.argmax(dim=-1)[0].tolist()', 'labels = [model.config.id2label[k] for k in ids]', '# then merge B-/I- pieces into whole entities']
      body = (
        <>
          <div className={s.units} role="list">
            {e.tokens.map((t, i) => (
              <div key={i} className={s.unit} role="listitem">
                <span className={`${s.uTok} ${isSpecial(t) ? s.uSpecial : ''}`}>{t}</span>
                <span className={`${s.ent} ${entClass(e.pred[i])}`}>{e.pred[i]}</span>
              </div>
            ))}
          </div>
          <pre className={s.result}>{e.entities.map((x) => `{'entity_group': '${x.group}', 'word': '${x.word}', 'score': ${x.score.toFixed(4)}}`).join('\n')}</pre>
        </>
      )
      note = <>Argmax picks one label per token. With <code>aggregation_strategy="simple"</code>, the pipeline glues word pieces and B-/I- runs back into whole names and averages their scores.</>
    }
  } else {
    if (st === 0) {
      code = ['from transformers import pipeline', 'summ = pipeline("summarization", model="google-t5/t5-small")', 'summ(text)          # transformers 4.x; see the note']
      body = <blockquote className={s.hint} style={{ margin: 0 }}>"{SUMM.text}"</blockquote>
      note = (
        <>
          A summary is a new sequence, so this is an <b>encoder-decoder</b> job (T5-small). Version 5 of <code>transformers</code> removed this pipeline, but
          the three stages below work in every version.
        </>
      )
    } else if (st === 1) {
      code = ['tok = AutoTokenizer.from_pretrained("google-t5/t5-small")', 'enc = tok("summarize: " + text, return_tensors="pt")']
      body = <Units tokens={SUMM.inTokens} ids={SUMM.inIds} max={14} />
      note = (
        <>
          T5 is told the task by a text prefix, <code>summarize:</code>. Its tokenizer marks the start of each word with ▁. The input is{' '}
          <b>{SUMM.inIds.length}</b> tokens long and ends with <code>&lt;/s&gt;</code> (id 1).
        </>
      )
    } else if (st === 2) {
      code = ['model = AutoModelForSeq2SeqLM.from_pretrained("google-t5/t5-small")', 'out = model.generate(**enc, max_new_tokens=40)   # one token at a time']
      body = <Units tokens={SUMM.outTokens} ids={SUMM.outIds} mask={false} max={14} />
      note = (
        <>
          The encoder reads all {SUMM.inIds.length} input tokens once; the decoder starts from <code>&lt;pad&gt;</code> (T5's start token) and writes{' '}
          <b>{SUMM.outIds.length - 1}</b> new tokens, one per step, until it stops. <code>generate</code> runs that loop for you.
        </>
      )
    } else {
      code = ['summary = tok.decode(out[0], skip_special_tokens=True)']
      body = <pre className={s.result}>{`'${SUMM.summary}'`}</pre>
      note = <>Decoding maps ids back to text pieces and joins them; <code>skip_special_tokens=True</code> drops <code>&lt;pad&gt;</code> and <code>&lt;/s&gt;</code>.</>
    }
  }

  return (
    <Figure
      wide
      title="Inside a pipeline: tokenizer → model → post-processing"
      caption={
        <>
          Choose a task and step through the stages. Every number shown is real output from the named model. Notice that the middle of every pipeline is
          the same (text becomes <code>input_ids</code> and an <code>attention_mask</code>, the model turns them into numbers) and only the last stage
          changes with the task: softmax and a label name for sentiment, one label per token for NER, and decoding generated ids back into text for a summary.
        </>
      }
    >
      <Controls>
        <Segmented
          label="task"
          value={task}
          onChange={(v) => {
            setTask(v)
            setExIdx(0)
          }}
          options={[
            { value: 'sent', label: 'sentiment' },
            { value: 'ner', label: 'named entities' },
            { value: 'summ', label: 'summary' },
          ]}
        />
        {examples.length > 1 && (
          <Segmented label="example" value={ei} onChange={setExIdx} options={examples.map((_, i) => ({ value: i, label: `${i + 1}` }))} />
        )}
      </Controls>

      <div className={s.stages} role="tablist" aria-label="Pipeline stages">
        {STAGES.map((name, k) => (
          <span key={name} style={{ display: 'contents' }}>
            <button
              type="button"
              role="tab"
              aria-selected={k === st}
              className={`${s.stage} ${k === st ? s.stageOn : k < st ? s.stageDone : ''}`}
              onClick={() => {
                player.pause()
                player.setStep(k)
              }}
            >
              {k}. {name}
            </button>
            {k < STAGES.length - 1 && <span className={s.arrow}>→</span>}
          </span>
        ))}
      </div>

      <Code lines={code} />
      <div className={s.panel}>{body}</div>
      <p className={s.hint}>{note}</p>
      <PlayerControls player={player} label={(k) => `stage ${k} of ${STAGES.length - 1}: ${STAGES[k]}`} />
    </Figure>
  )
}
