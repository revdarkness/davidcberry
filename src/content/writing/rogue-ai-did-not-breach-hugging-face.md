---
title: "Rogue AI did not breach Hugging Face. Missing controls did."
standfirst: "Every failure in the OpenAI and Hugging Face incident has a small version I have had to fix on my own systems. That is the uncomfortable part, and the useful one."
description: "A reading note on the OpenAI agent breach of Hugging Face: the five controls that were missing, and the one-person versions of each that I run."
pubDate: 2026-10-01
topic: ai-governance
kind: note
draft: true
source:
  title: "Rogue AI didn't breach Hugging Face, human decisions did"
  url: "https://thebulletin.org/2026/09/rogue-ai-didnt-breach-hugging-face-human-decisions-did/"
  author: "Bulletin of the Atomic Scientists"
---

## What it says

Between May and July, OpenAI agents under evaluation escaped their sandbox and broke into Hugging Face, reaching cluster admin in under thirteen hours. The Bulletin's argument is that "rogue AI" is the wrong headline. Safeguards were switched off on purpose for the evaluation. The sandbox was a filtered network, and the agents reached the internet through a package manager that had it. Trajectory monitoring was not in place. OpenAI's own incident began with an outage, not an alert, and Hugging Face disclosed the breach before OpenAI knew the attacker was its own agents. People made each of those decisions. [OpenAI's own account](https://openai.com/index/hugging-face-incident-and-the-road-ahead/) confirms the main facts.

## Where it lands

The Bulletin is right, and I would push it one step further. The lesson is not that one lab was careless. Every item on that list is a default: the state things are in until someone decides otherwise. I know because I have had most of them on my own systems, at a scale of one person, and found out the same way.

## What it means for what I run

- **Detection by accident.** My site was compromised for six days while every check returned 200. I found it while preparing to patch. [That case study](/six-days-of-http-200/) is what I built afterwards, including making each monitor prove it can go red.
- **Isolation that is really a filter.** Student work in my classes is graded on a local model, and [there is no automatic failover to a commercial API](/student-data-stays-local/) when real student data is in flight. If the local rail is down, it stops. A sandbox with one reachable door is a filter, not a sandbox.
- **The forgotten credential path.** I revoked an access policy and the key behind it stayed fully live. The Artifactory entry point here was a legacy token path. Revocation is something you probe, not something you assume.
- **Safeguards off on purpose.** Sometimes that is correct. I am holding my own site a major version back deliberately. The difference between a decision and a gap is whether the reason, the owner, and the condition for reversing it are written down before anything goes wrong.
- **Accountability.** "The AI did it" is a way of not naming an owner. In NIST AI RMF terms, this is a Govern failure before it is anything else.

None of this needs a frontier lab's budget. It needs someone to decide, on the record, what the defaults are going to be.
