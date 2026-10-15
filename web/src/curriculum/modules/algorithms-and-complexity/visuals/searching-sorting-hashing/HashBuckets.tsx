import { useState } from 'react'
import { Figure, Controls, Slider, Button, Readout, M } from '../../../../../kit'
import s from '../big-o/algo.module.css'
import h from './hash.module.css'

/*
  A hash table with chaining. Toy hash = sum of letter positions (a = 1 … z = 26), bucket =
  hash mod m. A lookup computes the bucket and only compares against the keys chained there.
  Real hash functions scramble far better, but the mechanics are the same.
*/

const START = ['laksa', 'satay', 'rojak', 'kaya', 'prata', 'chendol', 'popiah', 'otah', 'mee', 'kopi']
const MORE = ['teh', 'milo', 'bandung', 'tauhu', 'nasi', 'bakwan']

const letters = (k: string) => [...k].filter((c) => c >= 'a' && c <= 'z')
const toyHash = (k: string) => letters(k).reduce((t, c) => t + c.charCodeAt(0) - 96, 0)

interface Op {
  kind: 'insert' | 'lookup' | 'dup'
  key: string
}

export default function HashBuckets() {
  const [keys, setKeys] = useState<string[]>(START)
  const [m, setM] = useState(8)
  const [text, setText] = useState('otah')
  const [op, setOp] = useState<Op>({ kind: 'lookup', key: 'otah' })

  const buckets: string[][] = Array.from({ length: m }, () => [])
  for (const k of keys) buckets[toyHash(k) % m].push(k)

  const key = op.key
  const hv = toyHash(key)
  const b = hv % m
  const chain = buckets[b]
  const pos = chain.indexOf(key)
  const found = pos >= 0
  const checked = found ? pos + 1 : chain.length
  const listPos = keys.indexOf(key)
  const listChecks = listPos >= 0 ? listPos + 1 : keys.length

  const n = keys.length
  const longest = Math.max(...buckets.map((c) => c.length))
  const avgSuccess = n ? buckets.reduce((t, c) => t + (c.length * (c.length + 1)) / 2, 0) / n : 0

  const clean = (v: string) => v.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)
  const doInsert = () => {
    const k = clean(text)
    if (!k) return
    if (keys.includes(k)) setOp({ kind: 'dup', key: k })
    else {
      setKeys((ks) => [...ks, k])
      setOp({ kind: 'insert', key: k })
    }
  }
  const doLookup = () => {
    const k = clean(text)
    if (k) setOp({ kind: 'lookup', key: k })
  }

  const sum = letters(key)
    .map((c) => c.charCodeAt(0) - 96)
    .join(' + ')

  let message: string
  if (op.kind === 'dup') message = `'${key}' is already stored: a dict or set keeps each key only once.`
  else if (op.kind === 'insert') message = `Inserted '${key}' at the end of bucket ${b}'s chain${chain.length > 1 ? `, which now holds ${chain.length} keys (a collision)` : ''}.`
  else if (found) message = `Found '${key}' in bucket ${b} after ${checked} comparison${checked === 1 ? '' : 's'}. Scanning a list of all ${n} keys in order would take ${listChecks}.`
  else message = `Bucket ${b} ${chain.length ? `holds ${chain.length} key${chain.length === 1 ? '' : 's'}, none of them '${key}'` : 'is empty'}, so '${key}' is not stored: ${checked} comparison${checked === 1 ? '' : 's'}. A list would have to check all ${n}.`

  return (
    <Figure
      title="A hash table with buckets"
      caption={
        <>
          Type a hawker dish (letters only) and press Look up or Insert. The key's letters are added up (a = 1, …, z = 26) and the remainder
          after dividing by the number of buckets picks one bucket, so a lookup only checks the few keys in that bucket. Now squeeze the table
          down to 1 bucket: every key collides and the "hash table" becomes a plain list. 'laksa' and 'otah' have the same hash (44), so they
          share a bucket however many buckets there are. Real hash functions scramble the letters, so such clashes are rare (with this toy
          sum, anagrams such as 'tea' and 'eat' always collide).
        </>
      }
    >
      <div className={s.wrap}>
        <div className={h.inputRow}>
          <label className={h.inputLabel}>
            key
            <input
              type="text"
              value={text}
              onChange={(e) => setText(clean(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && doLookup()}
              className={h.input}
              aria-label="Key to insert or look up"
              spellCheck={false}
              autoCapitalize="off"
            />
          </label>
          <Button primary onClick={doLookup}>
            Look up
          </Button>
          <Button onClick={doInsert}>Insert</Button>
        </div>

        <div className={h.hashLine} aria-live="polite">
          <span className={s.mono}>
            hash('{key}') = {sum || '0'} = {hv}
          </span>
          <span className={s.mono}>
            {hv} mod {m} = <b>{b}</b>
          </span>
        </div>

        <div className={h.table} role="list" aria-label={`${m} buckets`}>
          {buckets.map((c, i) => (
            <div key={i} role="listitem" className={`${h.bucket} ${i === b ? h.bucketOn : ''}`}>
              <span className={h.bucketIdx}>{i}</span>
              <span className={h.chain}>
                {c.length === 0 && <span className={h.empty}>empty</span>}
                {c.map((k, j) => {
                  const isChecked = i === b && op.kind !== 'insert' && j < checked
                  const isHit = i === b && k === key
                  return (
                    <span key={k} className={h.chainItem}>
                      {j > 0 && <span className={h.link}>→</span>}
                      <span className={`${h.keyBox} ${isChecked ? h.keyChecked : ''} ${isHit ? h.keyHit : ''}`}>
                        {k}
                        {isChecked && <sup className={h.order}>{j + 1}</sup>}
                      </span>
                    </span>
                  )
                })}
              </span>
            </div>
          ))}
        </div>

        <div className={s.verdict}>{message}</div>

        <Controls>
          <Slider label={<>number of buckets <M>m</M></>} value={m} min={1} max={16} step={1} onChange={setM} />
          <Readout
            items={[
              ['keys n', String(n)],
              [<>load factor <M>{'\\alpha = n/m'}</M></>, (n / m).toFixed(2)],
              ['longest chain', String(longest)],
              ['avg checks to find a key', avgSuccess.toFixed(2)],
            ]}
          />
          <Button
            onClick={() => {
              const extra = MORE.filter((k) => !keys.includes(k))
              if (extra.length) {
                setKeys((ks) => [...ks, ...extra])
                setOp({ kind: 'insert', key: extra[extra.length - 1] })
              }
            }}
            disabled={MORE.every((k) => keys.includes(k))}
          >
            Add more dishes
          </Button>
          <Button
            onClick={() => {
              setKeys(START)
              setOp({ kind: 'lookup', key: 'otah' })
              setText('otah')
            }}
          >
            Reset
          </Button>
        </Controls>
      </div>
    </Figure>
  )
}
