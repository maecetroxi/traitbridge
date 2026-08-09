import test from "node:test";
import assert from "node:assert/strict";
import {
  CURATED_FILMS,
  DEFAULT_MEDIA_FILTERS,
  MEDIA_LIBRARY,
  MEDIA_TRAITS,
  filterMediaResources,
  getMediaTraitWeight,
  rankMediaResources,
  type MediaFilters,
} from "../lib/media-library";

test("combines the expanded book shelves with ten verified films", () => {
  assert.equal(
    MEDIA_LIBRARY.filter((resource) => resource.type === "nonfiction").length,
    17,
  );
  assert.equal(
    MEDIA_LIBRARY.filter((resource) => resource.type === "fiction").length,
    17,
  );
  assert.equal(CURATED_FILMS.length, 10);
  assert.equal(MEDIA_LIBRARY.length, 44);
  assert.equal(
    new Set(MEDIA_LIBRARY.map((resource) => resource.id)).size,
    MEDIA_LIBRARY.length,
  );
  assert.ok(MEDIA_LIBRARY.every((resource) => resource.year > 0));
  assert.ok(
    CURATED_FILMS.every(
      (film) =>
        film.year > 1900 &&
        film.creator.length > 0 &&
        film.source?.href.startsWith("https://"),
    ),
  );
});

test("every Big Five dimension represents both lower and higher profiles", () => {
  for (const trait of MEDIA_TRAITS) {
    const mappings = MEDIA_LIBRARY.flatMap((resource) =>
      resource.traitMappings.filter((mapping) => mapping.trait === trait),
    );

    assert.ok(
      mappings.some((mapping) => mapping.pole === "low"),
      `${trait} needs a lower-pole mapping`,
    );
    assert.ok(
      mappings.some((mapping) => mapping.pole === "high"),
      `${trait} needs a higher-pole mapping`,
    );
    assert.ok(
      mappings.some((mapping) => mapping.perspective === "mirror"),
      `${trait} needs a mirror mapping`,
    );
    assert.ok(
      mappings.some((mapping) => mapping.perspective === "growth"),
      `${trait} needs a growth mapping`,
    );
  }
});

test("all public-facing media text is complete in German and English", () => {
  for (const resource of MEDIA_LIBRARY) {
    assert.ok(resource.title.en.trim(), `${resource.id} has an English title`);
    assert.ok(resource.title.de.trim(), `${resource.id} has a German title`);
    assert.ok(
      resource.description.en.trim(),
      `${resource.id} has an English description`,
    );
    assert.ok(
      resource.description.de.trim(),
      `${resource.id} has a German description`,
    );

    for (const mapping of resource.traitMappings) {
      assert.ok(mapping.reason.en.trim(), `${resource.id} has an English reason`);
      assert.ok(mapping.reason.de.trim(), `${resource.id} has a German reason`);
    }
  }
});

test("combines format, perspective, theme, and search filters", () => {
  const filters: MediaFilters = {
    type: "film",
    traitFocus: "A",
    perspective: "mirror",
    theme: "community",
    search: "jury",
  };
  const results = filterMediaResources(MEDIA_LIBRARY, filters, "en");

  assert.deepEqual(results.map((resource) => resource.id), [
    "film-12-angry-men",
  ]);
});

test("represents middle profile mappings separately from content for both poles", () => {
  const middleMappings = MEDIA_LIBRARY.flatMap((resource) =>
    resource.traitMappings.filter((mapping) => mapping.pole === "middle"),
  );
  const noResults = filterMediaResources(
    MEDIA_LIBRARY,
    {
      ...DEFAULT_MEDIA_FILTERS,
      type: "film",
      perspective: "mirror",
      search: "not-a-real-title-123",
    },
    "de",
  );

  assert.ok(middleMappings.length > 0);
  assert.deepEqual(noResults, []);
});

test("weights distinctive traits automatically and doubles a manual focus", () => {
  const scores = { O: 5, C: 3, E: 2, A: 3.5, N: 3 };

  assert.equal(getMediaTraitWeight(scores, "O", "auto"), 2);
  assert.equal(getMediaTraitWeight(scores, "C", "auto"), 1);
  assert.equal(getMediaTraitWeight(scores, "A", "auto"), 1.25);
  assert.equal(getMediaTraitWeight(scores, "E", "E"), 2);
  assert.equal(getMediaTraitWeight(scores, "O", "E"), 1);
});

test("ranking is deterministic and reacts to the selected profile", () => {
  const reflective = { O: 4.8, C: 3, E: 1.2, A: 4.3, N: 4.1 };
  const steady = { O: 1.3, C: 4.4, E: 4.5, A: 1.7, N: 1.2 };
  const filters: MediaFilters = {
    ...DEFAULT_MEDIA_FILTERS,
    type: "film",
    perspective: "mirror",
  };

  const first = rankMediaResources(reflective, filters, "en");
  const second = rankMediaResources(reflective, filters, "en");
  const different = rankMediaResources(steady, filters, "en");

  assert.deepEqual(
    first.map(({ resource }) => resource.id),
    second.map(({ resource }) => resource.id),
  );
  assert.notDeepEqual(
    first.map(({ resource }) => resource.id),
    different.map(({ resource }) => resource.id),
  );
});

test("a manual trait focus reorders but never excludes eligible resources", () => {
  const scores = { O: 4.8, C: 2.7, E: 1.4, A: 3.1, N: 4.2 };
  const automatic = rankMediaResources(
    scores,
    { ...DEFAULT_MEDIA_FILTERS, type: "film" },
    "en",
  );
  const focused = rankMediaResources(
    scores,
    { ...DEFAULT_MEDIA_FILTERS, type: "film", traitFocus: "C" },
    "en",
  );

  assert.deepEqual(
    new Set(focused.map(({ resource }) => resource.id)),
    new Set(automatic.map(({ resource }) => resource.id)),
  );
  assert.notDeepEqual(
    focused.map(({ resource }) => resource.id),
    automatic.map(({ resource }) => resource.id),
  );
});
