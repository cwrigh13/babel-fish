import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    CheckCircle2,
    Circle,
    Globe2,
    Loader2,
    Monitor,
    RotateCcw,
    Smartphone,
    StickyNote,
    Tablet
} from 'lucide-react';
import { parseScenarios } from '../utils/parseScenarios';

const getNormalizedRole = (roleParam) => {
    if (!roleParam) return 'admin';
    return roleParam.toLowerCase();
};

const getIframeUrl = () => {
    return 'https://cwrigh13.github.io/babel-fish/';
};

const LiveTestPage = () => {
    const { role: roleParam } = useParams();
    const role = getNormalizedRole(roleParam);

    const [scenarios, setScenarios] = useState([]);
    const [selectedScenarioId, setSelectedScenarioId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [device, setDevice] = useState('desktop');
    const [iframeKey, setIframeKey] = useState(0);

    const [completedStepsByScenario, setCompletedStepsByScenario] = useState({});

    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [noteModalState, setNoteModalState] = useState(null);
    const [noteText, setNoteText] = useState('');

    const iframeUrl = getIframeUrl();

    useEffect(() => {
        const loadScenarios = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/user-testing-scenarios.md');
                if (!response.ok) {
                    throw new Error('Unable to load testing scenarios markdown.');
                }

                const markdown = await response.text();
                const parsed = parseScenarios(markdown);

                const filtered = parsed.filter((scenario) =>
                    (scenario.roleKey || '').toLowerCase() === role
                );

                const finalScenarios = filtered.length > 0 ? filtered : parsed;

                setScenarios(finalScenarios);
                setSelectedScenarioId(null);
            } catch (e) {
                setError(e.message || 'Failed to load scenarios.');
            } finally {
                setLoading(false);
            }
        };

        loadScenarios();
    }, [role]);

    const selectedScenario = useMemo(() => {
        if (!selectedScenarioId) {
            return null;
        }
        return scenarios.find((scenario) => scenario.id === selectedScenarioId) || null;
    }, [scenarios, selectedScenarioId]);

    const completedCount = useMemo(() => {
        if (!selectedScenario) return 0;
        const setForScenario = completedStepsByScenario[selectedScenario.id];
        return setForScenario ? setForScenario.size : 0;
    }, [completedStepsByScenario, selectedScenario]);

    const totalSteps = selectedScenario?.steps?.length || 0;
    const completionPercent =
        totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    const handleSelectScenario = (scenarioId) => {
        setSelectedScenarioId((prev) => (prev === scenarioId ? null : scenarioId));
    };

    const handleToggleStep = (scenarioId, index) => {
        setCompletedStepsByScenario((prev) => {
            const existing = prev[scenarioId]
                ? new Set(prev[scenarioId])
                : new Set();

            if (existing.has(index)) {
                existing.delete(index);
            } else {
                existing.add(index);
            }

            return {
                ...prev,
                [scenarioId]: existing
            };
        });
    };

    const handleResetEnvironment = () => {
        setIframeKey((prev) => prev + 1);
    };

    const getDeviceWidthClass = () => {
        if (device === 'tablet') {
            return 'w-[768px] max-w-full';
        }
        if (device === 'mobile') {
            return 'w-[375px] max-w-full';
        }
        return 'w-full max-w-[1200px]';
    };

    const openNoteModal = ({ scenario, stepIndex }) => {
        if (!scenario) return;

        setNoteText('');

        setNoteModalState({
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            role,
            stepIndex:
                typeof stepIndex === 'number' && stepIndex >= 0
                    ? stepIndex
                    : null,
            stepText:
                typeof stepIndex === 'number' && stepIndex >= 0
                    ? scenario.steps?.[stepIndex] || null
                    : null
        });

        setNoteModalOpen(true);
    };

    const closeNoteModal = () => {
        setNoteModalOpen(false);
        setNoteModalState(null);
        setNoteText('');
    };

    const githubIssueUrl = useMemo(() => {
        if (!noteModalState || !noteText.trim()) return null;

        const { scenarioTitle, stepIndex, stepText, role: noteRole } = noteModalState;

        const stepLabel = typeof stepIndex === 'number' && stepText
            ? `Step ${stepIndex + 1}: ${stepText}`
            : null;

        const title = stepLabel
            ? `[${noteRole}] ${scenarioTitle} — ${stepLabel}`
            : `[${noteRole}] ${scenarioTitle}`;

        const body = [
            `**Scenario:** ${scenarioTitle}`,
            stepLabel ? `**Step:** ${stepLabel}` : null,
            `**Role:** ${noteRole}`,
            ``,
            `**Observation:**`,
            noteText.trim(),
        ].filter(Boolean).join('\n');

        return `https://github.com/cwrigh13/babel-fish/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=user-testing`;
    }, [noteModalState, noteText]);

    const handleStepKeyDown = (event, scenarioId, index) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggleStep(scenarioId, index);
        }
    };

    const sidebarRoleLabel = useMemo(() => {
        if (!role) return 'Admin';
        const base = role.charAt(0).toUpperCase() + role.slice(1);
        return base;
    }, [role]);

    const isScenarioComplete = (scenario) => {
        if (!scenario || !scenario.steps || scenario.steps.length === 0) {
            return false;
        }
        const completedSet = completedStepsByScenario[scenario.id];
        if (!completedSet) return false;
        return completedSet.size >= scenario.steps.length;
    };

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB', fontFamily: "'Work Sans', sans-serif" }}>
            {/* Sidebar */}
            <aside className="w-80 min-w-[320px] bg-white border-r border-gray-200 flex flex-col shadow-lg">
                <div className="px-4 py-4 border-b border-gray-200" style={{ backgroundColor: '#007A70' }}>
                    <h1 className="text-lg font-bold text-white">
                        Live Test Scenarios
                    </h1>
                    <p className="mt-1 text-xs text-white/80">
                        Work through a scenario on the left while interacting with the
                        app on the right.
                    </p>

                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-4 pt-3 space-y-3">
                    {loading && (
                        <div className="flex items-center justify-center py-6 text-xs" style={{ color: '#6B7280' }}>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" style={{ color: '#00A99D' }} />
                            Loading scenarios...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            {error}
                        </div>
                    )}

                    {!loading && !error && scenarios.length === 0 && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-xs" style={{ color: '#6B7280' }}>
                            No scenarios found in{' '}
                            <span className="font-mono" style={{ color: '#007A70' }}>
                                user-testing-scenarios.md
                            </span>
                            .
                        </div>
                    )}

                    {!loading && !error && scenarios.length > 0 && (
                        <div className="space-y-2">
                            {scenarios.map((scenario) => {
                                const isActive =
                                    selectedScenario && scenario.id === selectedScenario.id;
                                const complete = isScenarioComplete(scenario);

                                return (
                                    <div key={scenario.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectScenario(scenario.id)}
                                            className="w-full rounded-xl px-3 py-2.5 text-left text-xs transition-all duration-200"
                                            style={{
                                                backgroundColor: isActive ? '#E0F2F1' : (complete ? '#F0FDF4' : 'white'),
                                                border: isActive ? '2px solid #00A99D' : (complete ? '2px solid #86EFAC' : '1px solid #E5E7EB'),
                                                boxShadow: isActive ? '0 4px 12px rgba(0, 169, 157, 0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                                                transform: isActive ? 'translateY(-1px)' : 'none',
                                                borderRadius: isActive ? '0.75rem 0.75rem 0 0' : undefined
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-[12px] font-semibold line-clamp-2" style={{ color: isActive ? '#007A70' : '#333333' }}>
                                                        {scenario.title}
                                                    </p>
                                                    {scenario.context && (
                                                        <p className="mt-1 text-[10px] line-clamp-2" style={{ color: '#6B7280' }}>
                                                            {scenario.context}
                                                        </p>
                                                    )}
                                                </div>
                                                {complete && (
                                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: '#00A99D' }} />
                                                )}
                                            </div>
                                        </button>

                                        {isActive && selectedScenario && (
                                            <div
                                                className="rounded-b-xl px-3 py-2.5 space-y-2"
                                                style={{
                                                    backgroundColor: '#E0F2F1',
                                                    borderLeft: '2px solid #00A99D',
                                                    borderRight: '2px solid #00A99D',
                                                    borderBottom: '2px solid #00A99D'
                                                }}
                                            >
                                                {totalSteps > 0 && (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-[10px]" style={{ color: '#6B7280' }}>
                                                            <span>{completionPercent}% complete</span>
                                                            <span>
                                                                {completedCount} / {totalSteps} steps
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'white' }}>
                                                            <div
                                                                className="h-full rounded-full transition-all duration-300"
                                                                style={{ width: `${completionPercent}%`, backgroundColor: '#00A99D' }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedScenario.steps && selectedScenario.steps.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        {selectedScenario.steps.map((step, index) => {
                                                            const completedForScenario =
                                                                completedStepsByScenario[
                                                                    selectedScenario.id
                                                                ];
                                                            const isCompleted =
                                                                completedForScenario &&
                                                                completedForScenario.has(index);

                                                            return (
                                                                <div
                                                                    key={`${selectedScenario.id}-step-${index}`}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onClick={() =>
                                                                        handleToggleStep(
                                                                            selectedScenario.id,
                                                                            index
                                                                        )
                                                                    }
                                                                    onKeyDown={(event) =>
                                                                        handleStepKeyDown(
                                                                            event,
                                                                            selectedScenario.id,
                                                                            index
                                                                        )
                                                                    }
                                                                    className="group flex items-start gap-2 rounded-xl px-2.5 py-2 text-[11px] transition-all duration-150 cursor-pointer"
                                                                    style={{
                                                                        backgroundColor: isCompleted ? 'white' : 'rgba(255,255,255,0.7)',
                                                                        border: isCompleted ? '1px solid #00A99D' : '1px solid #B2DFDB',
                                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                                                    }}
                                                                >
                                                                    <span className="mt-0.5 flex-shrink-0">
                                                                        {isCompleted ? (
                                                                            <CheckCircle2 className="h-4 w-4" style={{ color: '#00A99D' }} />
                                                                        ) : (
                                                                            <Circle className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                                                                        )}
                                                                    </span>
                                                                    <span className="flex-1" style={{ color: isCompleted ? '#007A70' : '#333333' }}>
                                                                        {step}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            openNoteModal({
                                                                                scenario: selectedScenario,
                                                                                stepIndex: index
                                                                            });
                                                                        }}
                                                                        className="ml-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 opacity-60 transition group-hover:opacity-100 hover:border-[#00A99D] hover:text-[#00A99D]"
                                                                        aria-label={`Add a note for step ${index + 1}`}
                                                                    >
                                                                        <StickyNote className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {selectedScenario.successCriteria &&
                                                    selectedScenario.successCriteria.length > 0 && (
                                                        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: 'white', border: '1px solid #B2DFDB' }}>
                                                            <p className="text-[11px] font-bold" style={{ color: '#007A70' }}>
                                                                Success state
                                                            </p>
                                                            <ul className="mt-1 space-y-0.5 pl-4 text-[11px] list-disc" style={{ color: '#333333' }}>
                                                                {selectedScenario.successCriteria.map(
                                                                    (criterion, index) => (
                                                                        <li key={`success-${index}`}>
                                                                            {criterion}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-white">
                    <button
                        type="button"
                        onClick={handleResetEnvironment}
                        className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:shadow-md"
                        style={{ backgroundColor: '#00A99D' }}
                    >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        Reset environment
                    </button>
                    <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
                        Reloads the app iframe.
                    </span>
                </div>
            </aside>

            {/* Browser pane */}
            <main className="flex-1 flex flex-col" style={{ backgroundColor: '#F1F3F4' }}>
                {/* Control bar */}
                <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#E0F2F1' }}>
                        <Globe2 className="h-4 w-4" style={{ color: '#007A70' }} />
                    </div>
                    <div className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs truncate" style={{ color: '#6B7280' }}>
                        {iframeUrl}
                    </div>

                    <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 px-1 py-0.5 text-[11px]">
                        <button
                            type="button"
                            onClick={() => setDevice('desktop')}
                            className="inline-flex items-center rounded-full px-2.5 py-1 transition-all duration-150"
                            style={{
                                backgroundColor: device === 'desktop' ? '#00A99D' : 'transparent',
                                color: device === 'desktop' ? 'white' : '#6B7280',
                                fontWeight: device === 'desktop' ? 600 : 400
                            }}
                            aria-label="Desktop viewport"
                        >
                            <Monitor className="mr-1 h-3.5 w-3.5" />
                            Desktop
                        </button>
                        <button
                            type="button"
                            onClick={() => setDevice('tablet')}
                            className="inline-flex items-center rounded-full px-2.5 py-1 transition-all duration-150"
                            style={{
                                backgroundColor: device === 'tablet' ? '#00A99D' : 'transparent',
                                color: device === 'tablet' ? 'white' : '#6B7280',
                                fontWeight: device === 'tablet' ? 600 : 400
                            }}
                            aria-label="Tablet viewport"
                        >
                            <Tablet className="mr-1 h-3.5 w-3.5" />
                            Tablet
                        </button>
                        <button
                            type="button"
                            onClick={() => setDevice('mobile')}
                            className="inline-flex items-center rounded-full px-2.5 py-1 transition-all duration-150"
                            style={{
                                backgroundColor: device === 'mobile' ? '#00A99D' : 'transparent',
                                color: device === 'mobile' ? 'white' : '#6B7280',
                                fontWeight: device === 'mobile' ? 600 : 400
                            }}
                            aria-label="Mobile viewport"
                        >
                            <Smartphone className="mr-1 h-3.5 w-3.5" />
                            Mobile
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetEnvironment}
                        className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg"
                        style={{ backgroundColor: '#00A99D' }}
                    >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        Reset
                    </button>
                </div>

                {/* Stage */}
                <div className="flex-1 flex items-center justify-center p-6 h-0">
                    <div
                        className={`relative ${getDeviceWidthClass()} h-full bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-500 ease-out`}
                        style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)', border: '1px solid #E5E7EB' }}
                    >
                        <iframe
                            key={iframeKey}
                            src={iframeUrl}
                            title="Application under test"
                            className="flex-1 w-full h-full bg-white"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation allow-downloads"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </main>

            {noteModalOpen && noteModalState && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" style={{ border: '1px solid #E5E7EB' }}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-bold" style={{ color: '#007A70' }}>
                                    Add testing note
                                </p>
                                <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
                                    Scenario:{' '}
                                    <span className="font-medium" style={{ color: '#333333' }}>
                                        {noteModalState.scenarioTitle}
                                    </span>
                                </p>
                                {typeof noteModalState.stepIndex === 'number' &&
                                    noteModalState.stepText && (
                                        <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
                                            Step {noteModalState.stepIndex + 1}:{' '}
                                            <span style={{ color: '#333333' }}>
                                                {noteModalState.stepText}
                                            </span>
                                        </p>
                                    )}
                            </div>
                            <button
                                type="button"
                                onClick={closeNoteModal}
                                className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Close note dialog"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="testing-note"
                                className="mb-1 block text-xs font-semibold"
                                style={{ color: '#333333' }}
                            >
                                Notes, bugs, or observations
                            </label>
                            <textarea
                                id="testing-note"
                                className="mt-1 h-28 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none"
                                style={{ color: '#333333' }}
                                placeholder="Describe what you observed, including any errors, confusion points, or UX issues."
                                value={noteText}
                                onChange={(event) => setNoteText(event.target.value)}
                            />

                        </div>

                        <p className="mt-3 text-[11px]" style={{ color: '#9CA3AF' }}>
                            This will open a pre-filled GitHub Issue in a new tab.
                        </p>

                        <div className="mt-3 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeNoteModal}
                                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium hover:bg-gray-50 transition"
                                style={{ color: '#333333' }}
                            >
                                Cancel
                            </button>
                            {githubIssueUrl ? (
                                <a
                                    href={githubIssueUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={closeNoteModal}
                                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg"
                                    style={{ backgroundColor: '#00A99D' }}
                                >
                                    Open GitHub Issue ↗
                                </a>
                            ) : (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white opacity-50 cursor-not-allowed"
                                    style={{ backgroundColor: '#00A99D' }}
                                >
                                    Open GitHub Issue ↗
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveTestPage;

