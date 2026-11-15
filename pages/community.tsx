import React, { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import CommunityParticipationGate from "../components/community/CommunityParticipationGate";
import {
  CommunityProfileBadge,
  CommunityProfileLegend,
} from "../components/community/CommunityProfileBadge";
import { useCommunityParticipation } from "../components/community/useCommunityParticipation";
import {
  COMMUNITY_CATEGORIES,
  COMMUNITY_POST_TYPES,
  filterAndSortQuestions,
  parseCommunityQuery,
  type CommunityCategory,
  type CommunityPostType,
  type CommunitySort,
} from "../lib/community";
import { formatTranslation } from "../lib/i18n";
import {
  createQuestion,
  getQuestions,
  type Question,
} from "../lib/supabase-queries";

const CommunityPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const { locale, copy } = useLocale();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CommunitySort>("newest");
  const [categoryFilter, setCategoryFilter] = useState<CommunityCategory | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionBody, setNewQuestionBody] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] =
    useState<CommunityCategory>("self-understanding");
  const [newPostType, setNewPostType] = useState<CommunityPostType>("question");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const participation = useCommunityParticipation(user);
  const registeredUser = participation.permanentUser;

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setQuestions(await getQuestions());
    } catch (loadQuestionsError) {
      console.error("Failed to load community questions:", loadQuestionsError);
      setLoadError(copy.community.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [copy.community.loadError]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const initialFilters = parseCommunityQuery(router.query);
    setCategoryFilter(initialFilters.category);
    setSearch(initialFilters.search);
  }, [router.isReady, router.query.category, router.query.search]);

  const visibleQuestions = useMemo(
    () =>
      filterAndSortQuestions(questions, {
        search,
        sort,
        category: categoryFilter,
      }),
    [categoryFilter, questions, search, sort],
  );

  const hasCommunityFilters =
    Boolean(search.trim()) || categoryFilter !== "all" || sort !== "newest";
  const activeFilterCount =
    Number(Boolean(search.trim())) +
    Number(categoryFilter !== "all") +
    Number(sort !== "newest");
  const resetCommunityFilters = () => {
    setSearch("");
    setSort("newest");
    setCategoryFilter("all");
  };

  const handleCreateQuestion = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!registeredUser || !newQuestionTitle.trim() || !newQuestionBody.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await participation.syncProfile();
      const createdQuestion = await createQuestion(
        registeredUser.id,
        newQuestionTitle,
        newQuestionBody,
        newQuestionCategory,
        newPostType,
      );
      setQuestions((currentQuestions) => [createdQuestion, ...currentQuestions]);
      setNewQuestionTitle("");
      setNewQuestionBody("");
      setNewQuestionCategory("self-understanding");
      setNewPostType("question");
      setIsComposerOpen(false);
    } catch (createQuestionError) {
      console.error("Failed to create question:", createQuestionError);
      setFormError(copy.community.createQuestionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateLocale = locale === "de" ? "de-CH" : "en-GB";
  const compactDate = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <Head>
        <title>{`${copy.community.title} | TraitBridge`}</title>
        <meta key="og-title" property="og:title" content={`${copy.community.title} | TraitBridge`} />
        <meta key="og-description" property="og:description" content={copy.community.intro} />
        <meta name="description" content={copy.community.intro} />
      </Head>

      <div className="community-page">
        <header className="section-hero community-hero">
          <div>
            <span className="page-kicker">{copy.community.kicker}</span>
            <h1 className="page-title">{copy.community.title}</h1>
            <p className="page-intro">{copy.community.intro}</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isAuthLoading}
            aria-expanded={isComposerOpen}
            aria-controls="community-question-composer"
            onClick={() => setIsComposerOpen((currentValue) => !currentValue)}
          >
            {isComposerOpen
              ? copy.community.closeComposer
              : copy.community.askQuestionAction}
          </button>
        </header>

        {isComposerOpen && (
          <section
            id="community-question-composer"
            className="surface community-composer"
            aria-label={copy.community.newQuestionTitle}
          >
            <CommunityParticipationGate
              participation={participation}
              returnTo="/community"
            >
              <form onSubmit={handleCreateQuestion} className="community-question-form">
                <div className="community-composer-heading">
                  <div>
                    <span className="page-kicker">{copy.community.composerKicker}</span>
                    <h2 id="community-composer-title">{copy.community.newQuestionTitle}</h2>
                  </div>
                  <p>{copy.community.composerGuidance}</p>
                </div>

                <div className="community-form-grid community-form-grid-three">
                  <div className="field-group">
                    <label htmlFor="community-post-type" className="field-label">
                      {copy.community.postTypeLabel}
                    </label>
                    <select
                      id="community-post-type"
                      value={newPostType}
                      onChange={(event) =>
                        setNewPostType(event.target.value as CommunityPostType)
                      }
                    >
                      {COMMUNITY_POST_TYPES.map((postType) => (
                        <option key={postType} value={postType}>
                          {copy.community.postTypes[postType]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label htmlFor="community-category" className="field-label">
                      {copy.community.categoryLabel}
                    </label>
                    <select
                      id="community-category"
                      value={newQuestionCategory}
                      onChange={(event) =>
                        setNewQuestionCategory(event.target.value as CommunityCategory)
                      }
                    >
                      {COMMUNITY_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {copy.community.categories[category]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label htmlFor="community-title" className="field-label">
                      {copy.community.titleLabel}
                    </label>
                    <input
                      id="community-title"
                      className="field-control"
                      type="text"
                      maxLength={160}
                      required
                      placeholder={copy.community.titlePlaceholder}
                      value={newQuestionTitle}
                      onChange={(event) => setNewQuestionTitle(event.target.value)}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="community-body" className="field-label">
                    {copy.community.questionLabel}
                  </label>
                  <textarea
                    id="community-body"
                    className="field-control"
                    rows={6}
                    maxLength={5000}
                    required
                    placeholder={copy.community.questionPlaceholder}
                    value={newQuestionBody}
                    onChange={(event) => setNewQuestionBody(event.target.value)}
                  />
                  <span className="field-hint">{copy.community.questionHint}</span>
                </div>

                {formError && (
                  <p className="text-danger" role="alert">
                    {formError}
                  </p>
                )}

                <div className="community-form-actions">
                  <button
                    type="submit"
                    disabled={
                      !newQuestionTitle.trim() ||
                      !newQuestionBody.trim() ||
                      isSubmitting
                    }
                    className="btn btn-primary"
                  >
                    {isSubmitting
                      ? copy.community.publishing
                      : copy.community.publishQuestion}
                  </button>
                  <span className="muted">{copy.community.publicPostingNote}</span>
                </div>
              </form>
            </CommunityParticipationGate>
          </section>
        )}

        {questions.length > 0 && (
          <>
        <button
          type="button"
          className="community-filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="community-filter-panel"
          onClick={() => setFiltersOpen((current) => !current)}
        >
          <span>
            {filtersOpen ? copy.community.closeFilters : copy.community.openFilters}
          </span>
          {activeFilterCount > 0 && <strong>{activeFilterCount}</strong>}
        </button>

        {hasCommunityFilters && (
          <div className="community-active-filters" aria-label={copy.community.activeFilters}>
            <span>{copy.community.activeFilters}</span>
            {search.trim() && <strong>“{search.trim()}”</strong>}
            {categoryFilter !== "all" && (
              <strong>{copy.community.categories[categoryFilter]}</strong>
            )}
            {sort !== "newest" && (
              <strong>
                {sort === "most-answers"
                  ? copy.community.sortMostAnswers
                  : copy.community.sortUnanswered}
              </strong>
            )}
            <button type="button" onClick={resetCommunityFilters}>
              {copy.community.resetFilters}
            </button>
          </div>
        )}

        <div
          id="community-filter-panel"
          className={`community-filter-panel${filtersOpen ? " community-filter-panel-open" : ""}`}
        >
        <section className="community-controls" aria-label={copy.community.filterLabel}>
          <div className="community-search">
            <label htmlFor="community-search" className="field-label">
              {copy.community.searchLabel}
            </label>
            <input
              id="community-search"
              type="search"
              className="field-control"
              placeholder={copy.community.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="field-group community-sort">
            <label htmlFor="community-sort" className="field-label">
              {copy.community.sortLabel}
            </label>
            <select
              id="community-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as CommunitySort)}
            >
              <option value="newest">{copy.community.sortNewest}</option>
              <option value="most-answers">{copy.community.sortMostAnswers}</option>
              <option value="unanswered">{copy.community.sortUnanswered}</option>
            </select>
          </div>
        </section>

        <div className="field-group category-filter-mobile">
          <label htmlFor="community-category-filter" className="field-label">
            {copy.community.categoryFilterLabel}
          </label>
          <select
            id="community-category-filter"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as CommunityCategory | "all")
            }
          >
            <option value="all">{copy.community.allCategories}</option>
            {COMMUNITY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {copy.community.categories[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="category-filter" role="group" aria-label={copy.community.categoryFilterLabel}>
          <button
            type="button"
            className={categoryFilter === "all" ? "category-chip category-chip-active" : "category-chip"}
            aria-pressed={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
          >
            {copy.community.allCategories}
          </button>
          {COMMUNITY_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={
                categoryFilter === category
                  ? "category-chip category-chip-active"
                  : "category-chip"
              }
              aria-pressed={categoryFilter === category}
              onClick={() => setCategoryFilter(category)}
            >
              {copy.community.categories[category]}
            </button>
          ))}
        </div>
        </div>

        <CommunityProfileLegend />
          </>
        )}

        {loadError && (
          <div className="community-status community-status-error" role="alert">
            <div>
              <strong>{loadError}</strong>
              <p>{copy.community.serviceUnavailable}</p>
            </div>
            <button type="button" className="btn btn-outline" onClick={() => void loadQuestions()}>
              {copy.community.retry}
            </button>
          </div>
        )}

        <section className="community-feed" aria-labelledby="community-feed-title">
          <div className="community-feed-heading">
            <div>
              <span className="page-kicker">{copy.community.feedKicker}</span>
              <h2 id="community-feed-title">{copy.community.allQuestionsTitle}</h2>
            </div>
            {!isLoading && (
              <span className="muted" aria-live="polite">
                {formatTranslation(
                  visibleQuestions.length === 1
                    ? copy.community.resultCountSingular
                    : copy.community.resultCount,
                  {
                  count: String(visibleQuestions.length),
                  },
                )}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="surface community-empty" role="status">
              <strong>{copy.community.loadingTitle}</strong>
              <p>{copy.community.loadingDescription}</p>
            </div>
          ) : visibleQuestions.length === 0 && !loadError ? (
            <div className="surface community-empty">
              <strong>
                {questions.length === 0
                  ? copy.community.noQuestions
                  : copy.community.noFilterResults}
              </strong>
              <p>
                {questions.length === 0
                  ? copy.community.noQuestionsDescription
                  : copy.community.noFilterResultsDescription}
              </p>
            </div>
          ) : (
            <div className="community-question-list">
              {visibleQuestions.map((question) => (
                <article key={question.id} className="surface community-question-card">
                  <div className="community-question-meta">
                    <div className="community-post-labels">
                      <span className="category-label">
                        {copy.community.postTypes[question.post_type]}
                      </span>
                      <span className="category-label">
                        {copy.community.categories[question.category]}
                      </span>
                    </div>
                    <time dateTime={question.created_at}>
                      {compactDate.format(new Date(question.created_at))}
                    </time>
                  </div>
                  <CommunityProfileBadge profile={question.author_profile} />
                  <h3>
                    <Link href={`/community/${question.id}`}>{question.title}</Link>
                  </h3>
                  <p>{question.body}</p>
                  <div className="community-card-footer">
                    <span>
                      {formatTranslation(
                        question.answer_count === 1
                          ? copy.community.answerCountSingular
                          : copy.community.answerCount,
                        {
                        count: String(question.answer_count),
                        },
                      )}
                    </span>
                    <Link href={`/community/${question.id}`} className="text-link">
                      {copy.community.openQuestion}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default CommunityPage;
