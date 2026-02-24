export type VocabularyItem = {
    id: string;
    user_id: string;
    english_word: string;
    french_translation: string;
    example_sentence: string | null;
    folder_id: string | null;
    created_at: string;
}

export type NewVocabularyItem = Omit<VocabularyItem, 'id' | 'user_id' | 'created_at'>;

export type Folder = {
    id: string;
    user_id: string;
    parent_id: string | null;
    name: string;
    created_at: string;
}
