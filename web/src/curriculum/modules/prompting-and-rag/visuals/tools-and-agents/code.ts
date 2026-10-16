/* Python for the lesson's runnable cell. Kept in a .ts file so MDX does not strip the indentation. */

export const AGENT_CODE = `import json
from datetime import date, datetime

# Tools: ordinary Python functions
def search(query):
    return "NOAI 2027 Preliminary Round: Friday 19 February 2027"

def get_today():
    # fixed, so output never changes
    return "2026-10-14"

def days_between(start, end):
    # fromisoformat: "2027-02-19" -> a date object;
    # one date minus another is a gap with .days
    d = date.fromisoformat(end) - date.fromisoformat(start)
    return d.days

TOOLS = {"search": search, "get_today": get_today,
         "days_between": days_between}

# A stand-in for the LLM
# A real LLM would read the whole history and write the
# next step as text. This rule-based fake does the same
# job so that the loop can run offline.
def fake_llm(history):
    seen = {m["tool"]: m["content"]
            for m in history if m["role"] == "tool"}
    if "search" not in seen:
        return {"thought": "I need the exam date.",
                "tool": "search",
                "args": {"query": "NOAI 2027 Prelim date"}}
    if "get_today" not in seen:
        return {"thought": "Now I need today's date.",
                "tool": "get_today", "args": {}}
    if "days_between" not in seen:
        text = seen["search"].split(": ")[1]
        # "Friday 19 February 2027" -> a date (%A day name,
        # %d day, %B month name, %Y year); .isoformat()
        # turns it back into "2027-02-19"
        exam = datetime.strptime(text, "%A %d %B %Y").date()
        return {"thought": "I'll let a tool count the days.",
                "tool": "days_between",
                "args": {"start": seen["get_today"],
                         "end": exam.isoformat()}}
    return {"thought": "I have everything I need.",
            "answer": seen["days_between"]
            + " days until the Prelim."}

# The agent loop: think -> act -> observe, with a step limit
question = "How many days until the NOAI 2027 Prelim?"
history = [{"role": "user", "content": question}]
MAX_STEPS = 5
for step in range(1, MAX_STEPS + 1):
    # think
    reply = fake_llm(history)
    print(f"step {step}: think: {reply['thought']}")
    if "answer" in reply:
        print("FINAL ANSWER:", reply["answer"])
        break
    # act: YOUR code runs the tool
    name, args = reply["tool"], reply["args"]
    # json.dumps: dict -> JSON text
    print(f"        act:   {name}({json.dumps(args)})")
    # ** unpacks the dict into keyword arguments,
    # e.g. search(query="NOAI 2027 Prelim date")
    result = TOOLS[name](**args)
    # observe: add the result
    print("        observation:", result)
    history.append({"role": "tool", "tool": name,
                    "content": str(result)})
else:  # a loop's else runs only if the loop ended WITHOUT break
    print("Stopped: hit the step limit without an answer.")`
