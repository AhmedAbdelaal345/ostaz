# Translation audit notes

The core teacher dashboard now renders in English through the `?lang=en` verification route. Dynamic dates and remaining-time strings are locale-aware, and the selected language remains persisted for normal navigation.

Student and entity profile pages must use their own `dir` attribute rather than a hard-coded RTL direction. The dashboard already has LTR shell rules; student and entity pages need localized alignment and back-arrow handling in the final CSS pass.

User-entered names, group names, assessment titles, and free-form notes remain unchanged by design and are not machine-translated.
