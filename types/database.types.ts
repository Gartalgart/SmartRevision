export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            vocabulary_items: {
                Row: {
                    id: string
                    user_id: string
                    english_word: string
                    french_translation: string
                    example_sentence: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    english_word: string
                    french_translation: string
                    example_sentence?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    english_word?: string
                    french_translation?: string
                    example_sentence?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "vocabulary_items_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            learning_progress: {
                Row: {
                    id: string
                    user_id: string
                    item_id: string
                    easiness_factor: number
                    interval_days: number
                    repetitions: number
                    next_review_date: string
                    status: 'new' | 'learning' | 'review' | 'mastered'
                    total_reviews: number
                    correct_reviews: number
                    last_review_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    item_id: string
                    easiness_factor?: number
                    interval_days?: number
                    repetitions?: number
                    next_review_date?: string
                    status?: 'new' | 'learning' | 'review' | 'mastered'
                    total_reviews?: number
                    correct_reviews?: number
                    last_review_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    item_id?: string
                    easiness_factor?: number
                    interval_days?: number
                    repetitions?: number
                    next_review_date?: string
                    status?: 'new' | 'learning' | 'review' | 'mastered'
                    total_reviews?: number
                    correct_reviews?: number
                    last_review_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "learning_progress_item_id_fkey"
                        columns: ["item_id"]
                        referencedRelation: "vocabulary_items"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "learning_progress_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            review_sessions: {
                Row: {
                    id: string
                    user_id: string
                    item_id: string
                    was_correct: boolean
                    difficulty_rating: number | null
                    response_time_ms: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    item_id: string
                    was_correct: boolean
                    difficulty_rating?: number | null
                    response_time_ms?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    item_id?: string
                    was_correct?: boolean
                    difficulty_rating?: number | null
                    response_time_ms?: number | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "review_sessions_item_id_fkey"
                        columns: ["item_id"]
                        referencedRelation: "vocabulary_items"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "review_sessions_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_due_reviews: {
                Args: Record<string, never>
                Returns: {
                    id: string
                    user_id: string
                    english_word: string
                    french_translation: string
                    example_sentence: string | null
                    created_at: string
                    // plus progress columns
                    item_id: string
                    easiness_factor: number
                    interval_days: number
                    repetitions: number
                    next_review_date: string
                    status: string
                    total_reviews: number
                    correct_reviews: number
                    last_review_date: string | null
                    updated_at: string
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
