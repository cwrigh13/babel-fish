export const parseScenarios = (markdown) => {
    if (!markdown || typeof markdown !== 'string') {
        return [];
    }

    const lines = markdown.split(/\r?\n/);
    const scenarios = [];

    let currentRoleKey = null;
    let currentScenario = null;

    const pushCurrentScenario = () => {
        if (currentScenario) {
            scenarios.push({ ...currentScenario });
            currentScenario = null;
        }
    };

    const deriveRoleKeyFromHeading = (headingLine) => {
        const raw = headingLine.replace(/^##\s*/i, '').replace(/SCENARIOS/i, '').trim();
        if (!raw) return null;
        return raw.toLowerCase().split(/\s+/)[0];
    };

    const parseScenarioHeading = (line) => {
        const withoutHashes = line.replace(/^###\s*/i, '').trim();
        const [left, ...rest] = withoutHashes.split(':');
        const idPart = (left || '').trim();
        const titlePart = rest.join(':').trim();
        const id = idPart || titlePart || `scenario-${scenarios.length + 1}`;
        const title = titlePart || idPart || id;
        return { id, title };
    };

    for (let i = 0; i < lines.length; i += 1) {
        const rawLine = lines[i];
        const line = rawLine.trim();

        if (!line) {
            continue;
        }

        if (line.startsWith('## ')) {
            pushCurrentScenario();
            currentRoleKey = deriveRoleKeyFromHeading(line);
            continue;
        }

        if (line.startsWith('### ')) {
            pushCurrentScenario();
            const { id, title } = parseScenarioHeading(line);
            currentScenario = {
                id,
                roleKey: currentRoleKey,
                title,
                context: '',
                steps: [],
                successCriteria: []
            };
            continue;
        }

        if (!currentScenario) {
            continue;
        }

        const lower = line.toLowerCase();

        if (lower.startsWith('**context**')) {
            const contextLines = [];
            const firstContextText = rawLine.split('**Context**:')[1];
            if (firstContextText && firstContextText.trim()) {
                contextLines.push(firstContextText.trim());
            }

            let j = i + 1;
            while (j < lines.length) {
                const lookahead = lines[j];
                const trimmedLookahead = lookahead.trim();
                if (
                    !trimmedLookahead ||
                    trimmedLookahead.startsWith('**') ||
                    trimmedLookahead.startsWith('## ') ||
                    trimmedLookahead.startsWith('### ')
                ) {
                    break;
                }
                contextLines.push(trimmedLookahead);
                j += 1;
            }

            currentScenario.context = contextLines.join(' ');
            i = j - 1;
            continue;
        }

        if (lower.startsWith('**workflow steps**')) {
            const steps = [];
            let j = i + 1;

            while (j < lines.length) {
                const lookahead = lines[j];
                const trimmedLookahead = lookahead.trim();

                if (!trimmedLookahead) {
                    break;
                }

                if (
                    trimmedLookahead.startsWith('**') ||
                    trimmedLookahead.startsWith('## ') ||
                    trimmedLookahead.startsWith('### ')
                ) {
                    break;
                }

                const match = trimmedLookahead.match(/^\d+\.\s+(.*)$/);
                if (match && match[1]) {
                    steps.push(match[1].trim());
                }

                j += 1;
            }

            currentScenario.steps = steps;
            i = j - 1;
            continue;
        }

        if (lower.startsWith('**success state**')) {
            const successCriteria = [];
            let j = i + 1;

            while (j < lines.length) {
                const lookahead = lines[j];
                const trimmedLookahead = lookahead.trim();

                if (!trimmedLookahead) {
                    break;
                }

                if (
                    trimmedLookahead.startsWith('**') ||
                    trimmedLookahead.startsWith('## ') ||
                    trimmedLookahead.startsWith('### ')
                ) {
                    break;
                }

                if (trimmedLookahead.startsWith('- ')) {
                    successCriteria.push(trimmedLookahead.slice(2).trim());
                } else {
                    const orderedMatch = trimmedLookahead.match(/^\d+\.\s+(.*)$/);
                    if (orderedMatch && orderedMatch[1]) {
                        successCriteria.push(orderedMatch[1].trim());
                    }
                }

                j += 1;
            }

            currentScenario.successCriteria = successCriteria;
            i = j - 1;
        }
    }

    pushCurrentScenario();

    return scenarios;
};

