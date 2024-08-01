# Interoperable Conversation Envelope Specification Overview

## Purpose and Usefulness

The Interoperable Conversation Envelope Specification, by the Open Voice Network (OVON), outlines a standardized method for facilitating communication between various dialog agents (assistants), whether human-operated or autonomous. This specification aims to create a seamless interaction experience by standardizing the format of conversation envelopes, which are structured in JSON. The standardized approach allows different systems to communicate effectively, paving the way for interoperable, cross-platform conversational agents.

## Key Components

### Conversation Envelopes

The primary objective of the conversation envelope is to enable various agents to participate in a conversation interoperably. By adhering to a common JSON structure, any dialog agent compliant with OVON can exchange messages, regardless of underlying architectures or technologies. 

### Delegation, Channeling, and Mediation

- **Delegation:** Transferring control from one dialog agent to another.
- **Channeling:** Acting as an intermediary, passing messages between agents without altering the message content.
- **Mediation:** Interacting with multiple agents behind the scenes to achieve a goal before responding to the user.

These patterns allow for sophisticated interactions and coordination between dialog agents.

### Discovery

Agents can query other agents to determine their capabilities and seek recommendations. This mechanism supports dynamic interaction scenarios where agents can propose themselves or others for specific tasks.

### Minimal Behaviors

Guidelines for compliant dialog assistants and conversation floor managers (the component managing the conversation flow):
- **Dialog Assistants:** Should handle various events like utterance, whisper, invite, and bye.
- **Conversation Floor Managers:** Responsible for forwarding utterances, managing invites and departures, and maintaining operational integrity of the ongoing conversation.

## Specification Details

### Syntax and Protocol

The conversation envelope is a standalone JSON object designed for flexibility across various communication protocols, with HTTPS being the initial recommended protocol.

### Schema and Structures

The conversation envelope and its components:
- **Schema Object:** Specifies the format and version.
- **Conversation Object:** Persistent information about the conversation.
- **Sender Object:** Details of the sender.
- **Events Object:** Lists events occurring in the conversation, such as utterances, whispers, and control messages like invite or bye.

### Event Types and Features

- **Utterance Events:** For spoken or written input.
- **Whisper Events:** For non-voiced instructions between agents.
- **Agent Control Events:** Include invite, bye, requestManifest, publishManifest, findAssistant, and proposeAssistant.

## Example Use Cases

1. **Basic Communication:** A user interacts with multiple autonomous assistants sequentially, managed by a conversation manager converting and forwarding messages.
2. **Delegated Tasks:** A dialog agent delegates part of the conversation or task to another agent, retaining overall control and context.
3. **Discovery and Recommendations:** Agents query or recommend other agents for specific tasks, enhancing service breadth dynamically.

## Reference Architecture

The specification includes schemas and reference examples to guide implementations:
- **JSON Schema:** A template for how conversation envelopes should be structured.
- **Event Objects:** Detailed descriptions and examples for each type of dialog event.

## Conclusion

By standardizing the structure and behavior of conversation envelopes, OVON aims to facilitate smoother, more efficient interactions among diverse dialog systems, enhancing both user experience and interoperability across platforms.

### Further Resources

- [OVON Interoperability of Conversational Assistants](https://openvoicenetwork.org/docs/interoperability-of-conversational-assistants/)
- [Interoperable Dialog Event Object Specification Version 1.0.1](https://github.com/open-voice-interoperability/docs/blob/main/specifications/DialogEvents/1.0.1/InteropDialogEventSpecs.md)
- [Assistant Manifest Specification Version 0.9.0](https://github.com/open-voice-interoperability/docs/blob/main/specifications/AssistantManifest/0.9.0/AssistantManifestSpec.md)