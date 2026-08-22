---
title: "Template: field note or essay"
standfirst: "The five-part shape every long piece on this site follows. Copy, rename, replace."
description: "Threat, decision, implementation, verification, residual risk. Draft, so it stays out of the list and the feed."
pubDate: 2026-08-22
topic: cyber
kind: essay
readingTime: "8 min read"
draft: true
---

State the claim in the first two sentences, before any setup. The version that
sounds slightly wrong until the reader gets to the evidence is usually the right
opening.

## The exposure, stated precisely

What was actually at risk, in specifics. Numbers, timestamps, error strings.
Vague threat descriptions are how a piece stops being evidence and starts being
an opinion.

## Why the obvious fix did not close it

The reason this is worth writing. If the first answer had worked there would be
nothing to say.

## What I built

The control itself. Name the architecture, never the hostnames, tailnet
addresses, usernames, or endpoint URLs. That rule is not optional here.

## How I verified it

Not "I configured it," but "I made it fail on purpose and watched it report the
failure." A control nobody tested is a belief.

## What is still sitting there

Every piece ends with the residual risk. A control with no stated residual risk
is a sales pitch, and leaving this section out is the fastest way to lose a
reader who does this for a living.
