import { supabase } from './supabase'
import { BigFiveScores } from '../components/PersonalityBadge'
import {
  isCommunityCategory,
  type CommunityCategory,
} from './community'

// Types
export type PersonalityResult = {
  id: string
  user_id: string
  scores: BigFiveScores
  calculated_scores?: any
  variant?: 'full'
  language?: string
  created_at: string
  updated_at: string
}

export type Question = {
  id: string
  user_id: string
  title: string
  body: string
  category: CommunityCategory
  answer_count: number
  created_at: string
  updated_at: string
}

export type Answer = {
  id: string
  question_id: string
  user_id: string
  body: string
  created_at: string
  updated_at: string
}

// Personality Results
export const savePersonalityResult = async (
  userId: string,
  scores: BigFiveScores,
  calculatedScores?: any,
  variant?: 'full',
  language?: string
) => {
  const { data, error } = await supabase
    .from('personality_results')
    .insert({
      user_id: userId,
      scores,
      calculated_scores: calculatedScores,
      variant,
      language: language || 'en',
    })
    .select()
    .single()

  if (error) throw error
  return data as PersonalityResult
}

export const getPersonalityResult = async (userId: string) => {
  const { data, error } = await supabase
    .from('personality_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 means no rows returned
  return data as PersonalityResult | null
}

export const updatePersonalityResult = async (
  resultId: string,
  scores: BigFiveScores,
  calculatedScores?: any,
  variant?: 'full'
) => {
  const { data, error } = await supabase
    .from('personality_results')
    .update({
      scores,
      calculated_scores: calculatedScores,
      variant,
      updated_at: new Date().toISOString(),
    })
    .eq('id', resultId)
    .select()
    .single()

  if (error) throw error
  return data as PersonalityResult
}

// Questions
const normalizeQuestion = (value: Record<string, any>): Question => ({
  id: String(value.id),
  user_id: String(value.user_id),
  title: String(value.title),
  body: String(value.body),
  category: isCommunityCategory(value.category) ? value.category : 'other',
  answer_count:
    typeof value.answer_count === 'number'
      ? value.answer_count
      : Array.isArray(value.answers) && typeof value.answers[0]?.count === 'number'
        ? value.answers[0].count
        : 0,
  created_at: String(value.created_at),
  updated_at: String(value.updated_at),
})

const isMissingQuestionCategoryError = (error: {
  code?: string
  message?: string
}) => {
  const message = error.message?.toLowerCase() || ''

  return (
    message.includes('category') &&
    (
      error.code === '42703' ||
      error.code === 'PGRST204' ||
      message.includes('does not exist') ||
      message.includes('schema cache')
    )
  )
}

export const createQuestion = async (
  userId: string,
  title: string,
  body: string,
  category: CommunityCategory,
) => {
  const { data, error } = await supabase
    .from('questions')
    .insert({
      user_id: userId,
      title: title.trim(),
      body: body.trim(),
      category,
    })
    .select()
    .single()

  if (error) throw error
  return normalizeQuestion(data)
}

export const getQuestions = async () => {
  const { data, error } = await supabase
    .from('questions')
    .select('id, user_id, title, body, category, created_at, updated_at, answers(count)')
    .order('created_at', { ascending: false })

  if (!error) {
    return (data || []).map((question) => normalizeQuestion(question))
  }

  // During a rolling deploy, keep public reading available until migration 003
  // has added the category column. New writes still require the migration.
  if (isMissingQuestionCategoryError(error)) {
    const { data: legacyData, error: legacyError } = await supabase
      .from('questions')
      .select('id, user_id, title, body, created_at, updated_at, answers(count)')
      .order('created_at', { ascending: false })

    if (legacyError) throw legacyError
    return (legacyData || []).map((question) => normalizeQuestion(question))
  }

  throw error
}

export const getQuestion = async (questionId: string) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (error) throw error
  return normalizeQuestion(data)
}

export const updateQuestion = async (questionId: string, title: string, body: string) => {
  const { data, error } = await supabase
    .from('questions')
    .update({
      title: title.trim(),
      body: body.trim(),
    })
    .eq('id', questionId)
    .select()
    .single()

  if (error) throw error
  return data as Question
}

export const deleteQuestion = async (questionId: string) => {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) throw error
}

// Answers
export const createAnswer = async (userId: string, questionId: string, body: string) => {
  const { data, error } = await supabase
    .from('answers')
    .insert({
      user_id: userId,
      question_id: questionId,
      body: body.trim(),
    })
    .select()
    .single()

  if (error) throw error
  return data as Answer
}

export const getAnswers = async (questionId: string) => {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Answer[]
}

export const updateAnswer = async (answerId: string, body: string) => {
  const { data, error } = await supabase
    .from('answers')
    .update({
      body: body.trim(),
    })
    .eq('id', answerId)
    .select()
    .single()

  if (error) throw error
  return data as Answer
}

export const deleteAnswer = async (answerId: string) => {
  const { error } = await supabase
    .from('answers')
    .delete()
    .eq('id', answerId)

  if (error) throw error
}



