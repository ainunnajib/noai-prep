/* Python for the lesson's runnable cell. Kept in a .ts file so MDX does not strip the indentation. */

export const AGENT_CODE = `import json
from datetime import date, datetime

# Tools: ordinary Python functions
def search(query):
    return "NOAI 2027 Preliminary Round: Friday 19 February 2027"

def get_today():
    return "2026-10-14"   # fixed, so the output never changes

def days_between(start, end):
    return (date.fromisoformat(end) - date.fromisoformat(start)).days

TOOLS = {"search": search, "get_today": get_today, "days_between": days_between}

# A stand-in for the LLM
# A real LLM would read the whole history and write the next step as text.
# This rule-based fake does the same job so the loop can run offline.
def fake_llm(history):
    seen = {m["tool"]: m["content"] for m in history if m["role"] == "tool"}
    if "search" not in seen:
        return {"tool": "search", "args": {"query": "NOAI 2027 Prelim date"}}
    if "get_today" not in seen:
        return {"tool": "get_today", "args": {}}
    if "days_between" not in seen:
        exam = datetime.strptime(seen["search"].split(": ")[1], "%A %d %B %Y").date()
        return {"tool": "days_between",
                "args": {"start": seen["get_today"], "end": exam.isoformat()}}
    return {"answer": seen["days_between"] + " days until the Prelim."}

# The agent loop: think -> act -> observe, with a step limit
history = [{"role": "user", "content": "How many days until the NOAI 2027 Prelim?"}]
MAX_STEPS = 5
for step in range(1, MAX_STEPS + 1):
    reply = fake_llm(history)                      # think
    if "answer" in reply:
        print("FINAL ANSWER:", reply["answer"])
        break
    name, args = reply["tool"], reply["args"]
    print(f"step {step}: {name}({json.dumps(args)})")
    result = TOOLS[name](**args)                   # act: YOUR code runs the tool
    print("        observation:", result)
    history.append({"role": "tool", "tool": name, "content": str(result)})  # observe
else:
    print("Stopped: hit the step limit without an answer.")`
