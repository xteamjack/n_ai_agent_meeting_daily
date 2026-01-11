# PipeCloud Daily Meeting bot

## 20260110a - Basic Joke bot ready
- Basic bot created with pipecat 0.0.98. Too many version issues, freeze this version
- RTVI being introduced here creating some issues, it is optional for basic bot but i preferred keeping it
- Two bots issue started cropping her, need to fix that

## 20260110b - Fix Ghost bot issue
- Ghost issue is fixed by add a singleton pattern and a pid lock
- Ghost issue is due to reusing the same meeting Url where in the previous bot was left
- Creating a new meeting url for each meeting instance also helped in solving the issue
- However now the process not terminating on ^c, this needs to be fixed

## 20260111a - Control C issue addressed
- Issue: Pipeline process is getting struct and not terminating gracefully
- a force shutdown introduced as KILL switch
- control c issues partially fixed, it was only tested by starting the stopping the server
- when meeting room open again same issue
- fixed by killing the process on second ^c

## 20260111a - Fix cartesia issue
- Introduce detailed logging with observer, but observer creates a very detailed logging so commented it
- cartesia is more of credits issue, new key added
