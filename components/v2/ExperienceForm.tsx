import { useId, useState, type FormEvent } from "react";
import { useLocale } from "../../contexts/LocaleContext";
import { errorText, v2Request } from "../../lib/v2/client";
import { topicLabels } from "../../lib/v2/copy";
import { classifyTopic } from "../../lib/v2/matching";
import { topics, type DiscoverItem, type Topic } from "../../lib/v2/types";
import SensitiveHint from "./SensitiveHint";

export default function ExperienceForm({
  owner,
  item,
  close,
  saved,
}: {
  owner: string;
  item?: DiscoverItem;
  close: () => void;
  saved: () => void;
}) {
  const { locale } = useLocale();
  const de = locale === "de";
  const formId = useId();
  const [title, setTitle] = useState(item?.title ?? "");
  const [body, setBody] = useState(item?.body ?? "");
  const [topic, setTopic] = useState<Topic | "">(item?.topic ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await v2Request(
        item ? "experience_edit" : "experience_publish",
        { id: item?.id, title, body, topic },
        undefined,
        owner,
      );
      saved();
    } catch (e) {
      setError(errorText(e, locale));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tb-panel tb-experience-form" aria-labelledby={formId}>
      <h2 id={formId}>
        {item
          ? de
            ? "Erfahrung bearbeiten"
            : "Edit experience"
          : de
            ? "Erfahrung teilen"
            : "Share an experience"}
      </h2>
      <form onSubmit={submit}>
        <label className="tb-label">
          {de ? "Deine Erfahrung" : "Your experience"}
          <textarea
            name="experience"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            autoFocus={!item}
            required
            minLength={20}
            maxLength={4000}
            rows={5}
          />
        </label>
        <SensitiveHint text={body} />
        <label className="tb-label">
          {de ? "Titel (optional)" : "Title (optional)"}
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
          />
        </label>
        <div className="tb-label">
          <label htmlFor={formId + "-topic"}>{de ? "Thema" : "Topic"}</label>
          <select
            id={formId + "-topic"}
            value={topic}
            onChange={(event) => setTopic(event.target.value as Topic | "")}
          >
            <option value="">
              {de ? "Automatisch auswählen" : "Choose automatically"}
            </option>
            {topics.map((value) => (
              <option key={value} value={value}>
                {topicLabels[locale][value]}
              </option>
            ))}
          </select>
        </div>
        {!topic && body.trim().length >= 20 && (
          <p className="tb-fine">
            {de ? "Vorschlag" : "Suggested topic"} ·{" "}
            {topicLabels[locale][classifyTopic(body)]}
          </p>
        )}
        {error && (
          <p role="alert" className="tb-error">
            {error}
          </p>
        )}
        <div className="tb-inline">
          <button className="tb-button" disabled={busy}>
            {item
              ? de
                ? "Änderungen speichern"
                : "Save changes"
              : de
                ? "Veröffentlichen"
                : "Publish"}
          </button>
          <button
            className="tb-text-button"
            type="button"
            disabled={busy}
            onClick={close}
          >
            {de ? "Abbrechen" : "Cancel"}
          </button>
        </div>
      </form>
    </section>
  );
}
