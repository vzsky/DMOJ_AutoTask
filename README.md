# DMOJ_AutoTask
Auto creating task file and push to the server. For DMOJ 

Turning a zipfile of configuration into DMOJ's config and push to the server.

```
INPUT :
  zipfile contains a single pdf file and testcases.
  a testcase must consist of .in file and either .out or .sol with the same filename
  to group testcases, name them with a common number / letter in front
```

```
OUTPUT : 
  will be pushed to the server.
  configuration in the proper directory (with prompted name: task)
  statement (pdf) in the proper directory (prompted filename: task)
```
