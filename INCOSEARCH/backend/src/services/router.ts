
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// NOTE: Make sure GEMINI_API_KEY is in your .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export type CategoryKey =
    | 'EXEOL_OPA'
    | 'EXEOL_GTA'
    | 'EXEOL_CLEAN_4E'
    | 'EXEOL_SEPT_FIRST'
    | 'EXEOL_SEPT_E2'
    | 'EXEOL_RINSEMATIC'
    | 'EXEOL_SURF_OPTIMAL'
    | 'EXEOL_SURF_30'
    | 'EXEOL_WIPE_OPTIMALS'
    | 'COMPETITOR'
    | 'GENERAL'
    | 'UNKNOWN';

export class RouterService {

    /**
     * Classify a user query into one of the 11 silos
     */
    async classifyQuery(query: string): Promise<CategoryKey> {
        try {
            const prompt = `
            You are an expert intent classifier for a healthcare infection control product system.
            Your task is to classify the USER QUERY into exactly one of the following categories (KEYS).
            
            PRODUCT CATEGORIES:
            1. EXEOL_OPA: Related to "Exeol OPA" (Disinfectant, high level).
            2. EXEOL_GTA: Related to "Exeol GTA".
            3. EXEOL_CLEAN_4E: Related to "Exeol Clean 4E" (Enzymatic cleaner).
            4. EXEOL_SEPT_FIRST: Related to "Exeol Sept First".
            5. EXEOL_SEPT_E2: Related to "Exeol Sept E2".
            6. EXEOL_RINSEMATIC: Related to "Exeol Rinsematic".
            7. EXEOL_SURF_OPTIMAL: Related to "Exeol Surf Optimal".
            8. EXEOL_SURF_30: Related to "Exeol Surf 30".
            9. EXEOL_WIPE_OPTIMALS: Related to "Exeol Wipe Optimals".

            COMPETITOR CATEGORY:
            10. COMPETITOR: Use this if the query mentions ANY competitor brand or product.
                Known brands: Anios, Bbraun, Hexanios, Surfanios, Gymp, Pfizer, Johnson & Johnson, 3M, Cidex, etc.
                Also use this if the query asks for "comparison", "market", "alternatives" without specifying a specific Exeol product as the primary focus.

            GENERAL CATEGORY:
            11. GENERAL: General infection control knowledge, guidelines, procedures, regulations, generic medical terms (e.g., "how to wash hands", "sterilization process").

            RULES:
            - Output ONLY the Key (e.g., "EXEOL_OPA"). Do not explain.
            - If uncertain, default to "GENERAL".
            
            USER QUERY: "${query}"
            CATEGORY KEY:
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text().trim().replace(/[\n\r]/g, '');

            // Validate output
            const validKeys: CategoryKey[] = [
                'EXEOL_OPA', 'EXEOL_GTA', 'EXEOL_CLEAN_4E', 'EXEOL_SEPT_FIRST', 'EXEOL_SEPT_E2',
                'EXEOL_RINSEMATIC', 'EXEOL_SURF_OPTIMAL', 'EXEOL_SURF_30', 'EXEOL_WIPE_OPTIMALS',
                'COMPETITOR', 'GENERAL'
            ];

            // Simple fuzzy matching if exact match fails
            if (validKeys.includes(text as CategoryKey)) {
                console.log(`[Router] Classified "${query}" -> ${text}`);
                return text as CategoryKey;
            }

            // Fallback: Check if response contains any key
            for (const key of validKeys) {
                if (text.includes(key)) {
                    console.log(`[Router] Classified "${query}" -> ${key} (fuzzy match)`);
                    return key;
                }
            }

            console.warn(`[Router] Could not classify "${query}". Response: "${text}". Defaulting to GENERAL.`);
            return 'GENERAL';

        } catch (error) {
            console.error('[Router] Classification failed:', error);
            return 'GENERAL'; // Fallback
        }
    }
}

export const routerService = new RouterService();
