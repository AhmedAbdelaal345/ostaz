# Translation audit notes

The core teacher dashboard now renders in English through the `?lang=en` verification route. Dynamic dates and remaining-time strings are locale-aware, and the selected language remains persisted for normal navigation.

Student and entity profile pages must use their own `dir` attribute rather than a hard-coded RTL direction. The dashboard already has LTR shell rules; student and entity pages need localized alignment and back-arrow handling in the final CSS pass.

User-entered names, group names, assessment titles, and free-form notes remain unchanged by design and are not machine-translated.

## Mobile English review

The attendance, groups, finance, weekly-exam, settings, and school-only year-work routes were reviewed in English at the mobile breakpoint. The review found static operational labels in attendance, group filters, finance status tabs, and the school-only empty state; these are catalogued in the shared legacy English map. Dynamic group names, student names, and teacher-entered content are intentionally retained.

The repeat mobile review confirms the static attendance, group, and school-only Year Work text is now English. Two dynamic values remain intentionally separate from the static map: the localized attendance date and a saved group weekday. These require component-level locale formatting rather than translating arbitrary saved content.
