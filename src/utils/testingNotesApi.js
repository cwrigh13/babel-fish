import { supabase } from '../lib/supabaseClient';

export const saveTestingNote = async ({ scenarioId, stepIndex, role, note }) => {
    const trimmedNote = note?.trim();

    if (!trimmedNote) {
        return { error: new Error('Note cannot be empty') };
    }

    if (!supabase) {
        return {
            error: new Error(
                'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable notes.'
            )
        };
    }

    const pageUrl =
        typeof window !== 'undefined' && window.location
            ? window.location.href
            : null;
    const userAgent =
        typeof navigator !== 'undefined' && navigator.userAgent
            ? navigator.userAgent
            : null;

    const payload = {
        scenario_id: scenarioId,
        step_index: typeof stepIndex === 'number' ? stepIndex : null,
        role,
        note: trimmedNote,
        page_url: pageUrl,
        user_agent: userAgent
    };

    const { data, error } = await supabase.from('testing_notes').insert([payload]);

    if (error) {
        return { error };
    }

    return { data };
};

