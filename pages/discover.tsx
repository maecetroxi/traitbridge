import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { DiscoverList } from "../components/v2/DiscoverList";
import ExperienceForm from "../components/v2/ExperienceForm";
import { AccessGate } from "../components/v2/Shared";
import { useAuth } from "../contexts/AuthContext";
import { useBridge } from "../contexts/BridgeContext";
import { useLocale } from "../contexts/LocaleContext";
import {
  buildLoginPath,
  buildOnboardingPath,
  participationPaths,
} from "../lib/return-path";
import { topicLabels } from "../lib/v2/copy";
import {
  topics,
  type DiscoverKind,
  type DiscoverPerspective,
  type Topic,
} from "../lib/v2/types";

export default function DiscoverPage() {
  const { locale } = useLocale();
  const { user, loading } = useAuth();
  const { snapshot, loading: bridgeLoading, error } = useBridge();
  const router = useRouter();
  const de = locale === "de";
  const owner = user && !user.is_anonymous ? user.id : null;
  const ready = Boolean(owner && snapshot.profile && !error);
  const writing = ready && router.query.write === "1";
  const own = router.query.view === "mine";
  const [kind, setKind] = useState<DiscoverKind | "">("");
  const [topic, setTopic] = useState<Topic | "">("");
  const [perspective, setPerspective] = useState<DiscoverPerspective | "">("");
  const [posted, setPosted] = useState(0);
  const close = () =>
    void router.replace("/discover", undefined, { scroll: false });
  const showOwn = (mine: boolean) => {
    const query = {
      ...(mine && { view: "mine" }),
      ...(writing && { write: "1" }),
    };
    void router.replace({ pathname: "/discover", query }, undefined, {
      scroll: false,
      shallow: true,
    });
  };
  const writePath = ready
    ? participationPaths.publish
    : owner
      ? buildOnboardingPath(participationPaths.publish)
      : buildLoginPath(participationPaths.publish, "signup");

  return (
    <div className="tb-page tb-discover-page">
      <Head>
        <title>
          {de ? "Entdecken | TraitBridge" : "Discover | TraitBridge"}
        </title>
      </Head>
      <div className="tb-page-heading">
        <h1>{de ? "Entdecken" : "Discover"}</h1>
        {!writing && !loading && !bridgeLoading && (
          <Link href={writePath} className="tb-button" scroll={false}>
            {de ? "Erfahrung teilen" : "Share an experience"}
          </Link>
        )}
      </div>
      <AccessGate discover>
        {owner && (
          <>
            {writing && (
              <ExperienceForm
                owner={owner}
                close={close}
                saved={() => {
                  setPosted((value) => value + 1);
                  setKind("");
                  setTopic("");
                  setPerspective("");
                  close();
                }}
              />
            )}
            {posted > 0 && !writing && (
              <p className="tb-success" role="status">
                {de ? "Erfahrung veröffentlicht." : "Experience published."}
              </p>
            )}
            <div className="tb-discover-controls">
              <div
                className="tb-discover-views"
                role="group"
                aria-label={de ? "Ansicht" : "View"}
              >
                <button
                  type="button"
                  className="tb-button secondary small"
                  aria-pressed={!own}
                  onClick={() => showOwn(false)}
                >
                  {de ? "Übersicht" : "Feed"}
                </button>
                <button
                  type="button"
                  className="tb-button secondary small"
                  aria-pressed={own}
                  onClick={() => showOwn(true)}
                >
                  {de ? "Meine Erfahrungen" : "My experiences"}
                </button>
              </div>
              {!own && (
                <div className="tb-discover-filters">
                  <div className="tb-label">
                    <label htmlFor="discover-kind">
                      {de ? "Beitragsart" : "Post type"}
                    </label>
                    <select
                      id="discover-kind"
                      value={kind}
                      onChange={(event) =>
                        setKind(event.target.value as DiscoverKind | "")
                      }
                    >
                      <option value="">
                        {de ? "Alle Beiträge" : "All posts"}
                      </option>
                      <option value="experience">
                        {de ? "Erfahrungen" : "Experiences"}
                      </option>
                      <option value="question">
                        {de ? "Fragen" : "Questions"}
                      </option>
                    </select>
                  </div>
                  <div className="tb-label">
                    <label htmlFor="discover-topic">
                      {de ? "Thema" : "Topic"}
                    </label>
                    <select
                      id="discover-topic"
                      value={topic}
                      onChange={(event) =>
                        setTopic(event.target.value as Topic | "")
                      }
                    >
                      <option value="">
                        {de ? "Alle Themen" : "All topics"}
                      </option>
                      {topics.map((value) => (
                        <option key={value} value={value}>
                          {topicLabels[locale][value]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="tb-label">
                    <label htmlFor="discover-perspective">
                      {de ? "Persönlichkeit" : "Personality"}
                    </label>
                    <select
                      id="discover-perspective"
                      value={perspective}
                      onChange={(event) =>
                        setPerspective(
                          event.target.value as DiscoverPerspective | "",
                        )
                      }
                    >
                      <option value="">
                        {de ? "Alle Persönlichkeiten" : "All personalities"}
                      </option>
                      <option value="similar">
                        {de ? "Ähnlich wie ich" : "Similar to me"}
                      </option>
                      <option value="different">
                        {de ? "Andere Perspektiven" : "Different perspectives"}
                      </option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <DiscoverList
              key={`${posted}:${own}:${kind}:${topic}:${perspective}`}
              owner={owner}
              mode={own ? "own" : "feed"}
              kind={own ? undefined : kind || undefined}
              topic={own ? undefined : topic || undefined}
              perspective={own ? undefined : perspective || undefined}
              showAllPersonalities={() => setPerspective("")}
            />
          </>
        )}
      </AccessGate>
    </div>
  );
}
