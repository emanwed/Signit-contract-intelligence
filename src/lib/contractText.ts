import type { Contract, ContractType, Fact, Lang } from "./types";
import { T } from "./i18n";

/** Arabic-Indic article numerals (Arabic screens read ١، ٢، ٣ …). */
const AR_NUM = ["", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠", "١١", "١٢", "١٣", "١٤"];

/** One-line description of what each contract type is about, per party purpose. */
const SCOPE: Record<ContractType, { ar: string; en: string }> = {
  nda: {
    ar: "تنظيم تبادل المعلومات السرية بين الطرفين والمحافظة على سريتها.",
    en: "govern the exchange of confidential information between the parties and safeguard its confidentiality.",
  },
  msa: {
    ar: "وضع الإطار العام الذي تُقدَّم بموجبه الخدمات، وتُنظَّم به بيانات الأعمال اللاحقة.",
    en: "establish the master framework under which services are delivered and future statements of work are governed.",
  },
  sow: {
    ar: "تحديد نطاق أعمال محدّد ومخرجاته وجدوله الزمني ضمن الاتفاقية الإطارية القائمة.",
    en: "define a specific scope of work, its deliverables and timeline under the governing master agreement.",
  },
  lease: {
    ar: "تأجير العين محل العقد للطرف الثاني للانتفاع بها وفق الغرض المتفق عليه.",
    en: "lease the premises to the second party for use in accordance with the agreed purpose.",
  },
  employment: {
    ar: "تنظيم علاقة العمل بين صاحب العمل والموظف وحقوق كل طرف والتزاماته.",
    en: "govern the employment relationship between the employer and the employee and each party's rights and obligations.",
  },
  po: {
    ar: "توريد الأصناف والكميات المحددة وفق المواصفات والأسعار والجداول المتفق عليها.",
    en: "supply the specified items and quantities in accordance with the agreed specifications, prices and schedules.",
  },
  licence: {
    ar: "منح الطرف الثاني ترخيص استخدام للبرمجيات أو الحقوق محل العقد وفق شروطه.",
    en: "grant the second party a licence to use the software or rights that are the subject of this agreement.",
  },
};

/** Which article each extracted fact belongs under, so it reads in context. */
const FACT_ARTICLE: Record<string, string> = {
  term: "term",
  renewal: "term",
  value: "financial",
  penalty: "financial",
  pdpl: "confidentiality",
  liability: "liability",
  ip: "ip",
  law: "law",
};

/**
 * Builds a full, formally-structured contract document from a contract's
 * extracted clauses and metadata — a preamble, recitals and numbered articles
 * (subject, term, consideration, obligations, confidentiality & data,
 * liability, IP, force majeure, termination, governing law, general provisions)
 * and a signature block. Seed contracts have no attached file, so this
 * reconstructs a readable "original" the Document view can show, with the real
 * source clauses embedded verbatim so they still highlight and stay searchable.
 */
export function synthesizeDoc(c: Contract, lang: Lang): string {
  const d = T[lang];
  const ar = lang === "ar";
  const title = ar ? c.title_ar : c.title_en;
  const party = ar ? c.party_ar : c.party_en;
  const clauseText = (f: Fact) => (ar ? f.sa : f.se);
  const firstParty = ar ? "المنشأة" : "the Company";

  // Group the extracted facts by the article they belong under; anything not
  // explicitly mapped falls into the general-provisions article so no clause is
  // lost (keeps highlighting and full-text search complete).
  const grouped: Record<string, Fact[]> = {};
  for (const f of c.facts) {
    const bucket = FACT_ARTICLE[f.k] ?? "general";
    (grouped[bucket] ??= []).push(f);
  }
  const factLines = (bucket: string): string[] => {
    const fs = grouped[bucket];
    if (!fs || fs.length === 0) return [];
    const dd = d as unknown as Record<string, string>;
    return fs.flatMap((f) => [
      `   ${ar ? "•" : "-"} ${dd[f.k] ?? f.k}: ${clauseText(f)}`,
    ]);
  };

  const out: string[] = [];
  const push = (...ls: string[]) => out.push(...ls);
  let n = 0;
  const art = (titleAr: string, titleEn: string, ...body: string[]) => {
    n += 1;
    const head = ar
      ? `المادة (${AR_NUM[n] ?? n}) — ${titleAr}`
      : `Article ${n} — ${titleEn}`;
    push(head, ...body.filter((l) => l !== undefined), "");
  };

  // Title + preamble
  push(
    ar ? `عقد ${title}` : `${title.toUpperCase()} AGREEMENT`,
    "",
    ar
      ? `أُبرم هذا العقد في مدينة الرياض بتاريخ ${c.endGreg} الموافق ${c.endHijri}هـ، وفقًا لأنظمة المملكة العربية السعودية، بين كلٍّ من:`
      : `This Agreement is entered into in the city of Riyadh on ${c.endGreg} (${c.endHijri} AH), pursuant to the laws of the Kingdom of Saudi Arabia, by and between:`,
    "",
    ar
      ? `الطرف الأول: ${firstParty}، ويمثّله المفوّض بالتوقيع نظامًا ("الطرف الأول")؛`
      : `First Party: ${firstParty}, represented by its duly authorised signatory ("First Party");`,
    ar
      ? `الطرف الثاني: ${party} ("الطرف الثاني").`
      : `Second Party: ${party} ("Second Party").`,
    "",
    ar
      ? 'ويُشار إليهما مجتمعَين بـ"الطرفين" ومنفردًا بـ"الطرف".'
      : 'Referred to collectively as the "Parties" and individually as a "Party".',
    "",
    ar ? "تمهيد" : "RECITALS",
    ar
      ? `لمّا كان الطرف الأول راغبًا في ${SCOPE[c.type].ar} وكان الطرف الثاني قادرًا على ذلك وفق خبرته وإمكاناته، وحيث إنّ الطرفين بكامل الأهلية المعتبرة شرعًا ونظامًا للتعاقد، فقد اتفقا على ما يلي:`
      : `Whereas the First Party wishes to ${SCOPE[c.type].en} and the Second Party is willing and able to do so given its experience and capabilities, and whereas the Parties have the full legal capacity to contract, the Parties have agreed as follows:`,
    "",
  );

  // Article 1 — Preamble & definitions
  art(
    "التمهيد والتعريفات",
    "Recitals and Definitions",
    ar
      ? "يُعدّ التمهيد أعلاه والملاحق المرفقة جزءًا لا يتجزأ من هذا العقد ومكمّلًا لأحكامه، وتُفسَّر مصطلحاته وفق المعنى المتعارف عليه في مجال التعاقد."
      : "The recitals above and the annexes attached hereto form an integral and complementary part of this Agreement, and its terms shall be construed in accordance with their commonly understood meaning.",
  );

  // Article 2 — Subject
  art(
    "موضوع العقد",
    "Subject of the Agreement",
    ar
      ? `يهدف هذا العقد إلى ${SCOPE[c.type].ar}`
      : `The purpose of this Agreement is to ${SCOPE[c.type].en}`,
  );

  // Article 3 — Term
  art(
    "مدة العقد وتجديده",
    "Term and Renewal",
    ar
      ? `تبدأ مدة هذا العقد من تاريخ توقيعه وتستمر سارية حتى ${c.endGreg} (${c.endHijri}هـ)، ما لم يُنهَ وفقًا لأحكامه.`
      : `This Agreement commences on the date of its signature and remains in force until ${c.endGreg} (${c.endHijri} AH), unless terminated in accordance with its terms.`,
    ...(c.autoRenew
      ? [
          ar
            ? `يتجدّد هذا العقد تلقائيًا لمدد مماثلة ما لم يُخطِر أحد الطرفين الآخر برغبته في عدم التجديد قبل ${c.noticeDays} يومًا من تاريخ الانتهاء.`
            : `This Agreement renews automatically for like periods unless either Party notifies the other of its intent not to renew at least ${c.noticeDays} days before the expiry date.`,
        ]
      : []),
    ...factLines("term"),
  );

  // Article 4 — Consideration
  art(
    "المقابل المالي وشروط الدفع",
    "Consideration and Payment Terms",
    c.valueSAR
      ? ar
        ? `يبلغ إجمالي القيمة التعاقدية ${new Intl.NumberFormat("ar-SA").format(c.valueSAR)} ريال سعودي، تُسدَّد وفق الجدول والدفعات المتفق عليها بين الطرفين.`
        : `The total contract value is SAR ${new Intl.NumberFormat("en-US").format(c.valueSAR)}, payable in accordance with the schedule and milestones agreed between the Parties.`
      : ar
        ? "يتحمّل كل طرف نفقاته الخاصة ما لم يُنَصّ على خلاف ذلك كتابةً."
        : "Each Party bears its own costs unless otherwise agreed in writing.",
    ...factLines("financial"),
  );

  // Article 5 — Obligations
  art(
    "التزامات الطرفين",
    "Obligations of the Parties",
    ar
      ? "يلتزم كل طرف بأداء ما يخصّه من التزامات هذا العقد بالعناية المهنية المعتادة، وبالتعاون وحُسن النية، وبتزويد الطرف الآخر بما يلزم من معلومات ومستندات في المواعيد المتفق عليها."
      : "Each Party shall perform its obligations under this Agreement with due professional care, in good faith and cooperation, and shall provide the other Party with the information and documents required within the agreed timelines.",
  );

  // Article 6 — Confidentiality & data
  art(
    "السرية وحماية البيانات",
    "Confidentiality and Data Protection",
    ar
      ? "يلتزم الطرفان بالمحافظة على سرية المعلومات المتبادلة وعدم إفشائها للغير دون موافقة كتابية مسبقة، وبالامتثال لنظام حماية البيانات الشخصية (PDPL) ولوائحه التنفيذية فيما يتعلّق بأي بيانات شخصية تُعالَج بموجب هذا العقد."
      : "The Parties shall keep the exchanged information confidential and shall not disclose it to third parties without prior written consent, and shall comply with the Personal Data Protection Law (PDPL) and its implementing regulations for any personal data processed under this Agreement.",
    ...factLines("confidentiality"),
  );

  // Article 7 — Liability & indemnity
  art(
    "المسؤولية والتعويض",
    "Liability and Indemnity",
    ar
      ? "يكون كل طرف مسؤولًا عن الأضرار المباشرة الناتجة عن إخلاله بالتزاماته، مع مراعاة أي سقف للمسؤولية متفق عليه أدناه، ويُعوّض الطرف الآخر عمّا يلحقه من أضرار مباشرة ناشئة عن ذلك الإخلال."
      : "Each Party is liable for direct damages arising from its breach of obligations, subject to any liability cap agreed below, and shall indemnify the other Party for direct damages resulting from such breach.",
    ...factLines("liability"),
  );

  // Article 8 — Intellectual property
  art(
    "الملكية الفكرية",
    "Intellectual Property",
    ar
      ? "تبقى الحقوق الفكرية السابقة لكل طرف مملوكةً له، وتؤول ملكية المخرجات المُنتَجة خصيصًا بموجب هذا العقد وفق ما يتفق عليه الطرفان صراحةً."
      : "Each Party's pre-existing intellectual property remains its own, and ownership of deliverables produced specifically under this Agreement shall vest as expressly agreed between the Parties.",
    ...factLines("ip"),
  );

  // Article 9 — Force majeure
  art(
    "القوة القاهرة",
    "Force Majeure",
    ar
      ? "لا يُسأل أي طرف عن الإخلال الناتج عن ظرف قاهر خارج عن إرادته المعقولة، على أن يُخطِر الطرف الآخر خلال مدة معقولة ويبذل ما في وسعه للحدّ من أثره."
      : "Neither Party is liable for a breach caused by a force-majeure event beyond its reasonable control, provided it notifies the other Party within a reasonable period and uses its best efforts to mitigate the impact.",
  );

  // Article 10 — Termination
  art(
    "الإنهاء",
    "Termination",
    ar
      ? "يجوز إنهاء هذا العقد باتفاق الطرفين كتابةً، أو من الطرف غير المُخِلّ عند إخلال الطرف الآخر بالتزام جوهري وعدم تصحيحه خلال المدة المحددة في إشعار كتابي، مع عدم الإخلال بالحقوق المكتسبة حتى تاريخ الإنهاء."
      : "This Agreement may be terminated by written mutual agreement, or by the non-defaulting Party upon a material breach by the other Party that remains uncured within the period stated in a written notice, without prejudice to rights accrued up to the termination date.",
  );

  // Article 11 — Governing law
  art(
    "القانون الواجب التطبيق وتسوية النزاعات",
    "Governing Law and Dispute Resolution",
    ar
      ? "يخضع هذا العقد لأنظمة المملكة العربية السعودية ويُفسَّر وفقها، وتختصّ بالفصل في أي نزاع ينشأ عنه الجهةُ القضائية المختصة بمدينة الرياض."
      : "This Agreement is governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia, and the competent judicial authority in the city of Riyadh has jurisdiction over any dispute arising from it.",
    ...factLines("law"),
  );

  // Article 12 — General provisions
  art(
    "أحكام عامة",
    "General Provisions",
    ar
      ? "لا يجوز التنازل عن هذا العقد أو أيٍّ من الحقوق الناشئة عنه للغير دون موافقة كتابية مسبقة. ولا يُعدّ أي تعديل عليه نافذًا ما لم يكن كتابةً وموقّعًا من الطرفين. ويمثّل هذا العقد وملاحقه كامل الاتفاق بين الطرفين ويحلّ محلّ أي تفاهمات سابقة."
      : "This Agreement, or any right arising from it, may not be assigned to a third party without prior written consent. No amendment is effective unless made in writing and signed by both Parties. This Agreement and its annexes constitute the entire agreement between the Parties and supersede any prior understandings.",
    ...factLines("general"),
  );

  // Automated review note (if the contract has a flagged anomaly).
  const anomaly = ar ? c.anomaly_ar : c.anomaly_en;
  if (anomaly) {
    push(
      ar
        ? "ملاحظة تدقيق آلي: قد يتطلّب أحد البنود أعلاه مراجعة قانونية قبل الاعتماد."
        : "Automated review note: one of the clauses above may require legal review before approval.",
      "",
    );
  }

  // Signature block
  push(
    ar
      ? "وقد حُرِّر هذا العقد من نسختين أصليتين، تسلّم كل طرف نسخةً منها للعمل بموجبها."
      : "This Agreement has been executed in two original counterparts, one delivered to each Party to act upon.",
    "",
    ar ? "الطرف الأول" : "First Party",
    `${firstParty}`,
    ar ? "الاسم: ______________    التوقيع: ______________    التاريخ: ______________" : "Name: ______________    Signature: ______________    Date: ______________",
    "",
    ar ? "الطرف الثاني" : "Second Party",
    `${party}`,
    ar ? "الاسم: ______________    التوقيع: ______________    التاريخ: ______________" : "Name: ______________    Signature: ______________    Date: ______________",
  );

  return out.join("\n");
}

/** The document text to display — the real one if present, else a synthesis. */
export function documentText(c: Contract, lang: Lang): string {
  return c.docText && c.docText.trim().length > 0
    ? c.docText
    : synthesizeDoc(c, lang);
}
