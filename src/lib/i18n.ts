import type { ContractType, FactKey, Lang } from "./types";

/**
 * Bilingual UI dictionary. `dir` drives real RTL/LTR layout mirroring at the
 * root layout. Ported from reference/baseerah.jsx.
 */
/** Copy for the "Add a signed contract" modal. */
export interface AddDict {
  title: string;
  subtitle: string;
  upload: string;
  uploadHint: string;
  orPaste: string;
  placeholder: string;
  analyze: string;
  analyzing: string;
  review: string;
  aiFilled: string;
  aiFailed: string;
  fTitle: string;
  fParty: string;
  fType: string;
  selectType: string;
  fValue: string;
  fEnd: string;
  fNotice: string;
  fAutoRenew: string;
  fRisk: string;
  needTitle: string;
  save: string;
  cancel: string;
  attached: string;
}

export interface Dict {
  dir: "rtl" | "ltr";
  name: string;
  tag: string;
  overview: string;
  notifications: string;
  list: string;
  searchContracts: string;
  noMatches: string;
  colName: string;
  colParty: string;
  colActions: string;
  reset: string;
  colStatus: string;
  colStart: string;
  colEnd: string;
  colAutoRenew: string;
  colValue: string;
  colRisk: string;
  stActive: string;
  stDraft: string;
  stInactive: string;
  tagExpiring: string;
  contractsCount: string;
  classification: string;
  classConfidence: string;
  classAuto: string;
  classSpotcheck: string;
  classQueue: string;
  classAutoHint: string;
  classSpotcheckHint: string;
  classQueueHint: string;
  classManual: string;
  classManualHint: string;
  fltNeedsClass: string;
  autoOn: string;
  autoOff: string;
  fltStatus: string;
  fltType: string;
  fltAll: string;
  rowsPerPage: string;
  pageOf: string;
  radar: string;
  ask: string;
  askSuggestFor: string;
  review: string;
  legal: string;
  proc: string;
  exec: string;
  totalCommit: string;
  activeContracts: string;
  next90: string;
  concentration: string;
  pdpl: string;
  exposure: string;
  catHint: string;
  upcoming: string;
  autoRenewRisk: string;
  noticeWindow: string;
  daysLeft: string;
  leverage: string;
  riskOverview: string;
  anomalies: string;
  byRisk: string;
  liabilityExposure: string;
  jurisdiction: string;
  playbookDev: string;
  playbookMet: string;
  high: string;
  medium: string;
  low: string;
  verified: string;
  needsReview: string;
  confidence: string;
  source: string;
  showSource: string;
  askPlaceholder: string;
  thinking: string;
  matches: string;
  noReview: string;
  confirm: string;
  edit: string;
  confirmed: string;
  value: string;
  term: string;
  renewal: string;
  liability: string;
  penalty: string;
  ip: string;
  law: string;
  counterparty: string;
  type: string;
  back: string;
  exportContract: string;
  editContract: string;
  saveChanges: string;
  deleteContract: string;
  confirmDelete: string;
  none: string;
  vat: string;
  open: string;
  riskFlag: string;
  live: string;
  demo: string;
  langBtn: string;
  types: Record<ContractType, string>;
  filterCap: string;
  filterRenew: string;
  filterUploaded: string;
  clear: string;
  trustNote: string;
  hijri: string;
  greg: string;
  newContract: string;
  navHome: string;
  navDocuments: string;
  navContracts: string;
  navTemplates: string;
  navReports: string;
  settings: string;
  getHelp: string;
  accMyAccount: string;
  accBilling: string;
  accLogout: string;
  accDark: string;
  accLight: string;
  viewAs: string;
  prototype: string;
  planLabel: string;
  resetDemo: string;
  resetDemoDone: string;
  planFree: string;
  planPaid: string;
  proOnly: string;
  proLockPersona: string;
  upgradePro: string;
  freeBanner: string;
  freeContractsOf: string;
  freeMoreLocked: string;
  proGateTitle: string;
  proGateBody: string;
  extractProNote: string;
  dashProLabel: string;
  dashProSub: string;
  radarProNote: string;
  complianceProNote: string;
  anomalyProChip: string;
  riskTab: string;
  riskTitle: string;
  riskDimsTitle: string;
  riskLow: string;
  riskHigh: string;
  riskBandHigh: string;
  riskBandMed: string;
  riskBandLow: string;
  riskProNote: string;
  pbVs: string;
  dimLiability: string;
  dimLiabilityInd: string;
  dimTermination: string;
  dimTerminationInd: string;
  dimIp: string;
  dimIpInd: string;
  dimIndemnity: string;
  dimIndemnityInd: string;
  dimAutorenew: string;
  dimAutorenewInd: string;
  dimLaw: string;
  dimLawInd: string;
  pbLiability: string;
  pbNotice: string;
  pbJurisdiction: string;
  pbPdpl: string;
  pbIndemnity: string;
  obTab: string;
  obCalTitle: string;
  obIntro: string;
  obPayment: string;
  obDeliverable: string;
  obCompliance: string;
  obNotice: string;
  obInsurance: string;
  obRenewal: string;
  obReview: string;
  tierOverdue: string;
  tierD1: string;
  tierD7: string;
  tierD30: string;
  tierLater: string;
  obOwner: string;
  obEscalate: string;
  obAlertsVia: string;
  obSimNote: string;
  obEmpty: string;
  ssTab: string;
  radarTab: string;
  radarIntro: string;
  radarRec: string;
  radarEmptyTitle: string;
  radarEmpty: string;
  radarLogAction: string;
  radarAssignPlaceholder: string;
  radarReopen: string;
  radarResolvedCount: string;
  radarRelated: string;
  radarConflictCards: string;
  askClauseHint: string;
  askClauseCta: string;
  askClauseStandard: string;
  askClauseWhy: string;
  askClauseLinked: string;
  notifSettingsTab: string;
  complianceTab: string;
  notifSettingsIntro: string;
  notifUnreadOnly: string;
  notifNoUnread: string;
  freeContractsNote: string;
  makeRoomTitle: string;
  makeRoomBody: string;
  makeRoomUpgrade: string;
  actReview: string;
  actNotify: string;
  actNegotiate: string;
  actClaim: string;
  actComplete: string;
  actVerify: string;
  actDetails: string;
  ssTitle: string;
  ssIntro: string;
  ssPlaceholder: string;
  ssSim: string;
  ssSimNote: string;
  ssNoResults: string;
  ssStep1: string;
  ssStep2: string;
  ssStep3: string;
  ssStep4: string;
  freeUploadTitle: string;
  freeUploadBody: string;
  emailProNote: string;
  planCompare: string;
  cmpTitle: string;
  cmpSubtitle: string;
  cmpFeature: string;
  keepFree: string;
  cmpLenses: string;
  cmpUploads: string;
  cmpAsk: string;
  cmpExtraction: string;
  valExecOnly: string;
  valAllLenses: string;
  valUploadsFree: string;
  valUploadsPro: string;
  valAskSingle: string;
  valAskPortfolio: string;
  secIngest: string;
  secCompliance: string;
  secObligations: string;
  secIntel: string;
  cmpSourceClauses: string;
  cmpPdpl: string;
  cmpZatca: string;
  cmpAnomaly: string;
  cmpRenewals: string;
  cmpDashboard: string;
  cmpWorkflow: string;
  cmpCompanyDocs: string;
  cmpActionWindow: string;
  valExtractFree: string;
  valExtractPro: string;
  valPdplFree: string;
  valPdplPro: string;
  valRenewFree: string;
  valRenewPro: string;
  valActionWindowFree: string;
  valActionWindowPro: string;
  setTitle: string;
  setIntro: string;
  setRegulations: string;
  setPlaybook: string;
  setCompanyDocs: string;
  setCompanyDocsHint: string;
  setUpload: string;
  setNoDocs: string;
  setAppliedNote: string;
  remove: string;
  notifCenter: string;
  notifOpen: string;
  notifEmpty: string;
  notifPrefsTitle: string;
  notifPrefsHint: string;
  notifPrefsLink: string;
  notifBackToList: string;
  notifMutedNote: string;
  alertRenewal: string;
  alertCompliance: string;
  alertAnomaly: string;
  alertReview: string;
  notifMasterTitle: string;
  notifMasterHint: string;
  notifMasterOn: string;
  notifMasterOff: string;
  notifAllOff: string;
  notifMarkAllRead: string;
  fltUnread: string;
  fltDone: string;
  acNeedAction: string;
  acDone: string;
  acAllClear: string;
  streamRenewals: string;
  streamVerify: string;
  streamCompliance: string;
  streamAnomaly: string;
  taskAssignee: string;
  taskUnassigned: string;
  taskTags: string;
  taskAddTag: string;
  taskComments: string;
  taskNoComments: string;
  taskAddComment: string;
  commentHint: string;
  taskSend: string;
  taskActivity: string;
  taskNoActivity: string;
  taskMarkDone: string;
  taskDone: string;
  taskReopen: string;
  taskViewContract: string;
  taskRelatedContract: string;
  taskOutcome: string;
  taskOutcomePrompt: string;
  taskNextStep: string;
  actDone: string;
  actReopen: string;
  actAssigned: string;
  actUnassigned: string;
  actTagAdd: string;
  actTagRemove: string;
  actComment: string;
  actOutcome: string;
  notBuiltTitle: string;
  notBuiltBody: string;
  valuesTab: string;
  documentTab: string;
  docReconstructed: string;
  docUploaded: string;
  add: AddDict;
}

export const T: Record<Lang, Dict> = {
  ar: {
    dir: "rtl",
    name: "ساين إت",
    tag: "ذكاء العقود بعد التوقيع",
    overview: "نظرة عامة",
    notifications: "مركز الإجراءات",
    list: "كل العقود",
    searchContracts: "ابحث في العقود…",
    noMatches: "لا نتائج مطابقة.",
    colName: "الاسم",
    colParty: "الطرف المقابل",
    colActions: "الإجراءات",
    reset: "إعادة تعيين",
    colStatus: "الحالة",
    colStart: "تاريخ البدء",
    colEnd: "تاريخ الانتهاء",
    colAutoRenew: "التجديد التلقائي",
    colValue: "القيمة",
    colRisk: "المخاطر",
    stActive: "نشط",
    stDraft: "مسودة",
    stInactive: "غير نشط",
    tagExpiring: "قريب الانتهاء",
    contractsCount: "عقود",
    classification: "التصنيف",
    classConfidence: "ثقة التصنيف",
    classAuto: "تصنيف تلقائي",
    classSpotcheck: "فحص عشوائي",
    classQueue: "تصنيف يدوي",
    classAutoHint: "ثقة عالية (>٩٥٪) — صُنّف تلقائيًا.",
    classSpotcheckHint: "ثقة (٨٥–٩٥٪) — صُنّف تلقائيًا مع علامة فحص عشوائي.",
    classQueueHint: "ثقة منخفضة (<٨٥٪) — بانتظار تصنيف بشري.",
    classManual: "صُنّف يدويًا",
    classManualHint: "اخترت النوع عند الرفع — لا حاجة لمراجعة.",
    fltNeedsClass: "بحاجة لمراجعة التصنيف",
    autoOn: "تلقائي",
    autoOff: "يدوي",
    fltStatus: "الحالة",
    fltType: "النوع",
    fltAll: "الكل",
    rowsPerPage: "الصفوف لكل صفحة",
    pageOf: "صفحة {n} من {m}",
    radar: "رادار الالتزامات",
    ask: "اسأل ساين إت",
    askSuggestFor: "مقترحات لهذه الصفحة",
    review: "تحتاج مراجعتك",
    legal: "المستشار القانوني",
    proc: "إدارة المشتريات",
    exec: "الإدارة التنفيذية",
    totalCommit: "إجمالي الالتزامات التعاقدية",
    activeContracts: "عقود نشطة",
    next90: "التزامات خلال ٩٠ يومًا",
    concentration: "تركّز المورّدين",
    pdpl: "التزام حماية البيانات (PDPL)",
    exposure: "التوزّع حسب الفئة",
    catHint: "اضغط فئة للتصفية",
    upcoming: "تجديدات قادمة",
    autoRenewRisk: "معرّضة للتجديد التلقائي",
    noticeWindow: "نافذة الإشعار",
    daysLeft: "يوم متبقٍ",
    leverage: "نقاط التفاوض",
    riskOverview: "خريطة المخاطر",
    anomalies: "تعارضات مرصودة",
    byRisk: "العقود حسب الخطورة",
    liabilityExposure: "انكشاف المسؤولية",
    jurisdiction: "الاختصاص المفضّل",
    playbookDev: "مخالفات دليل السياسات",
    playbookMet: "مطابق لدليل السياسات",
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
    verified: "موثّقة",
    needsReview: "بحاجة لمراجعة",
    confidence: "درجة الثقة",
    source: "المصدر في العقد",
    showSource: "أرِني المصدر",
    askPlaceholder:
      "اسأل عن محفظتك… مثال: أي عقود المورّدين بسقف مسؤولية أقل من مليون ريال؟",
    thinking: "ساين إت يقرأ العقود…",
    matches: "عقود مطابقة",
    noReview: "لا توجد عناصر بانتظار المراجعة — أحسنت.",
    confirm: "تأكيد",
    edit: "تعديل",
    confirmed: "تم التأكيد",
    value: "القيمة",
    term: "المدة",
    renewal: "التجديد",
    liability: "سقف المسؤولية",
    ip: "الملكية الفكرية",
    penalty: "الغرامات",
    law: "القانون الحاكم",
    counterparty: "الطرف الآخر",
    type: "النوع",
    back: "رجوع",
    exportContract: "تصدير",
    editContract: "تعديل",
    saveChanges: "حفظ التغييرات",
    deleteContract: "حذف العقد",
    confirmDelete: "تأكيد الحذف؟",
    none: "غير محدّد",
    vat: "ضريبة القيمة المضافة",
    open: "فتح العقد",
    riskFlag: "تنبيه مخاطرة",
    live: "ذكاء مباشر",
    demo: "تجريبي",
    langBtn: "EN",
    types: {
      nda: "اتفاقية سرية (NDA)",
      msa: "اتفاقية إطارية (MSA)",
      sow: "بيان عمل (SOW)",
      lease: "عقد إيجار",
      employment: "عقد عمل",
      po: "أمر شراء",
      licence: "اتفاقية ترخيص",
    },
    filterCap: "سقف مسؤولية < مليون ر.س",
    filterRenew: "تجديد خلال ٩٠ يومًا",
    filterUploaded: "المرفوعة",
    clear: "الكل",
    trustNote:
      "كل قيمة مُستخرَجة بالذكاء الاصطناعي مرتبطة بمصدرها في العقد ودرجة ثقتها. اضغط أي قيمة لرؤية النص الأصلي.",
    hijri: "هـ",
    greg: "م",
    newContract: "عقد جديد",
    navHome: "الرئيسية",
    navDocuments: "المستندات",
    navContracts: "العقود",
    navTemplates: "القوالب",
    navReports: "التقارير",
    settings: "الإعدادات",
    getHelp: "الحصول على مساعدة",
    accMyAccount: "حسابي",
    accBilling: "الخطة والفوترة",
    accLogout: "تسجيل الخروج",
    accDark: "الوضع الداكن",
    accLight: "الوضع الفاتح",
    viewAs: "العرض بصفة",
    prototype: "نموذج أولي",
    planLabel: "الخطة",
    resetDemo: "إعادة ضبط بيانات النموذج الأولي",
    resetDemoDone: "تمت إعادة تعيين العرض إلى حالته الأصلية",
    planFree: "مجانية",
    planPaid: "احترافية",
    proOnly: "ميزة احترافية",
    proLockPersona: "العدسات الأخرى متاحة في الخطة الاحترافية",
    upgradePro: "الترقية للاحترافية",
    freeBanner: "أنت على الخطة المجانية",
    freeContractsOf: "تعرض {n} من {m} عقود",
    freeMoreLocked: "{n} عقود إضافية متاحة في الخطة الاحترافية",
    proGateTitle: "ميزة احترافية",
    proGateBody:
      "إدارة التنبيهات كإجراءات (الإسناد، التعليقات، الحالة، سجل النشاط) متاحة في الخطة الاحترافية.",
    extractProNote:
      "الاستخراج الكامل (المسؤولية، الغرامات، القانون، PDPL) ودرجات الثقة متاحة في الاحترافية.",
    dashProLabel: "لوحة تنفيذية كاملة",
    dashProSub: "التركّز والتعرّض والامتثال",
    radarProNote:
      "الرادار الكامل (هجري + تنبيهات الإشعار) متاح في الاحترافية — هذه قائمة أساسية.",
    complianceProNote:
      "إعداد فحوصات الامتثال (PDPL / ZATCA / دليل السياسات) متاح في الخطة الاحترافية.",
    anomalyProChip: "كشف الشذوذ — احترافية",
    riskTab: "المخاطر",
    riskTitle: "درجة مخاطر العقد",
    riskDimsTitle: "أبعاد المخاطر",
    riskLow: "٠ منخفض",
    riskHigh: "١٠٠ مرتفع",
    riskBandHigh: "مخاطر عالية",
    riskBandMed: "مخاطر متوسطة",
    riskBandLow: "مخاطر منخفضة",
    riskProNote: "تقييم المخاطر ومقارنة الدليل متاحان في الخطة الاحترافية.",
    pbVs: "مقابل",
    dimLiability: "التعرّض للمسؤولية",
    dimLiabilityInd: "سقف أقل من مليون أو أقل من قيمة العقد",
    dimTermination: "مخاطر الإنهاء",
    dimTerminationInd: "إنهاء للملاءمة بإشعار قصير",
    dimIp: "مخاطر الملكية الفكرية",
    dimIpInd: "نقل الملكية للعميل دون استثناءات",
    dimIndemnity: "اختلال التعويض",
    dimIndemnityInd: "تعويض أحادي الجانب",
    dimAutorenew: "مخاطر التجديد التلقائي",
    dimAutorenewInd: "نافذة إشعار قصيرة لمنع التجديد",
    dimLaw: "القانون الحاكم",
    dimLawInd: "تحكيم إلزامي في موطن الطرف المقابل",
    pbLiability: "سقف المسؤولية",
    pbNotice: "إشعار التجديد التلقائي",
    pbJurisdiction: "الاختصاص القضائي",
    pbPdpl: "معالجة البيانات (PDPL)",
    pbIndemnity: "التعويض",
    obTab: "الالتزامات",
    obCalTitle: "تقويم الالتزامات",
    obIntro:
      "كل ما يحتاج إلى إجراء في مكان واحد — تجديدات ومدفوعات وتسليمات وامتثال وإشعارات ومراجعات — مرتّبة حسب الاستحقاق، مع إشعار المسؤول وتصعيد للمدير عند التأخّر.",
    obPayment: "دفع",
    obDeliverable: "تسليم",
    obCompliance: "امتثال",
    obNotice: "إشعار",
    obInsurance: "تأمين",
    obRenewal: "تجديد",
    obReview: "مراجعة",
    tierOverdue: "متأخّر",
    tierD1: "خلال يوم",
    tierD7: "خلال ٧ أيام",
    tierD30: "خلال ٣٠ يومًا",
    tierLater: "لاحقًا",
    obOwner: "المسؤول",
    obEscalate: "يُصعَّد إلى",
    obAlertsVia: "تنبيه عبر البريد و Slack",
    obSimNote: "التنبيهات محاكاة في النموذج الأولي.",
    obEmpty: "لا التزامات مسجّلة.",
    ssTab: "بحث دلالي",
    radarTab: "رادار التناقضات",
    radarIntro:
      "يرصد الرادار العقود التي تتعارض شروطها مع بعضها عبر المحفظة — تخزين البيانات، سقف المسؤولية، نافذة إشعار التجديد، والاختصاص القضائي — ليكشف المواضع التي تتبنّى فيها المؤسسة موقفين متناقضين. اضغط أي عقد لفتحه.",
    radarRec: "التوصية",
    radarEmptyTitle: "لا تناقضات في المحفظة",
    radarEmpty:
      "شروط عقودكم النشطة متّسقة عبر الأبعاد المراقَبة. سيظهر أي تعارض جديد هنا فور رفع عقد يخالف الباقي.",
    radarLogAction: "سجّل الإجراء",
    radarAssignPlaceholder: "تعيين لفريق",
    radarReopen: "إعادة الفتح",
    radarResolvedCount: "تمّت معالجته",
    radarRelated: "العقود المتعارضة",
    radarConflictCards: "عقود متعارضة",
    askClauseHint: "حدّد نصًا لشرحه",
    askClauseCta: "اشرح هذا البند",
    askClauseStandard: "قياسي أم لا؟",
    askClauseWhy: "لماذا يهمّك",
    askClauseLinked: "مرتبط ببند مُستخرَج",
    notifSettingsTab: "إعدادات التنبيهات",
    complianceTab: "الامتثال والسياسات",
    notifSettingsIntro: "اختر كيف تصلك التنبيهات وأي أنواع منها تريد أن تستقبل.",
    notifUnreadOnly: "غير المقروءة",
    notifNoUnread: "لا توجد تنبيهات غير مقروءة",
    freeContractsNote: "الخطة المجانية · ٣ عقود",
    makeRoomTitle: "أفسِح مكانًا لعقد جديد",
    makeRoomBody: "خطتك المجانية تتضمّن ٣ عقود نشطة. احذف أحدها لإضافة عقد جديد.",
    makeRoomUpgrade: "أو رقِّ لعقود غير محدودة",
    actReview: "راجِع",
    actNotify: "أخطِر",
    actNegotiate: "فاوض",
    actClaim: "طالِب",
    actComplete: "أكمِل",
    actVerify: "وثّق",
    actDetails: "التفاصيل",
    ssTitle: "البحث الدلالي في العقود",
    ssIntro: "ابحث بالمعنى لا بالكلمة: اكتب سؤالك بلغتك، ويعرض لك النظام العقود والبنود ذات الصلة حتى لو اختلفت صياغتها عن كلماتك.",
    ssPlaceholder: "ابحث بالمعنى… مثال: التزامات المسؤولية",
    ssSim: "تشابه",
    ssSimNote:
      "يحاكي خط أنابيب التضمين (Query → Embedding → Vector DB → Similarity) دون استدعاء نموذج تضمين حيّ.",
    ssNoResults: "لا تطابق دلالي — جرّب صياغة أخرى (المسؤولية، التجديد، البيانات، الدفع، القانون).",
    ssStep1: "الاستعلام",
    ssStep2: "نموذج التضمين",
    ssStep3: "قاعدة المتجهات",
    ssStep4: "أقرب تطابق",
    freeUploadTitle: "وصلت للحد المجاني للرفع",
    freeUploadBody:
      "تسمح الخطة المجانية برفع ٣ عقود. رقِّ للخطة الاحترافية لرفع عدد غير محدود من العقود.",
    emailProNote: "إشعارات البريد الإلكتروني متاحة في الخطة الاحترافية.",
    planCompare: "قارن الخطط",
    cmpTitle: "قارن بين الخطط",
    cmpSubtitle: "شاهد ما تفوّته على الخطة المجانية",
    cmpFeature: "الميزة",
    keepFree: "الاستمرار بالمجانية",
    cmpLenses: "عدسات الأدوار",
    cmpUploads: "إدخال العقود",
    cmpAsk: "اسأل ساين إت (سؤال وجواب)",
    cmpExtraction: "استخراج القيم بالذكاء",
    valExecOnly: "عدسة واحدة فقط",
    valAllLenses: "الثلاث عدسات",
    valUploadsFree: "يدوي — حتى ٣",
    valUploadsPro: "غير محدود + ترحيل العقود القديمة",
    valAskSingle: "عقودك المرفوعة فقط",
    valAskPortfolio: "المحفظة كاملة",
    secIngest: "الإدخال والاستخراج",
    secCompliance: "الامتثال",
    secObligations: "الالتزامات والعدسات",
    secIntel: "ذكاء المحفظة",
    cmpSourceClauses: "عرض البند المصدر لكل قيمة",
    cmpPdpl: "حماية البيانات (PDPL)",
    cmpZatca: "الفوترة والغرامات (ZATCA)",
    cmpAnomaly: "كشف الشذوذ في البنود",
    cmpRenewals: "تتبّع التجديدات",
    cmpDashboard: "لوحة تنفيذية (تركّز/تعرّض/تصدير للمجلس)",
    cmpWorkflow: "سير عمل الإجراءات (إسناد للفرق، تعليقات)",
    cmpCompanyDocs: "مستندات سياسات الشركة (رفع ومراجعة)",
    cmpActionWindow: "نطاق مركز الإجراءات الزمني",
    valExtractFree: "أساسي: طرف، قيمة، تاريخ",
    valExtractPro: "المخطط الكامل + درجات ثقة",
    valPdplFree: "عدد العقود فقط",
    valPdplPro: "ماسح تعرّض بربط المواد",
    valRenewFree: "قائمة ميلادية أساسية",
    valRenewPro: "رادار + تنبيهات الإشعار",
    valActionWindowFree: "المتأخر وخلال ٧ أيام",
    valActionWindowPro: "التقويم الكامل (٣٠+ يومًا)",
    setTitle: "إعداد الامتثال والمراجعة",
    setIntro:
      "حدّد ما يُراجَع عليه كل مستند: الأنظمة المحلية وقواعد دليل سياسات شركتك. يُطبَّق ما تُفعّله تلقائيًا على كامل المحفظة.",
    setRegulations: "الأنظمة واللوائح المحلية",
    setPlaybook: "قواعد دليل السياسات",
    setCompanyDocs: "مستندات سياسات الشركة",
    setCompanyDocsHint:
      "ارفع سياسات شركتك (PDF أو نص) لتُراجَع العقود بناءً عليها.",
    setUpload: "ارفع مستندات",
    setNoDocs: "لا مستندات مرفوعة بعد.",
    setAppliedNote: "تُطبَّق هذه الإعدادات على مراجعة كل مستند في المحفظة.",
    remove: "إزالة",
    notifCenter: "التنبيهات",
    notifOpen: "فتح التنبيهات",
    notifEmpty: "لا توجد تنبيهات — كل شيء على ما يُرام.",
    notifPrefsTitle: "تفضيلات التنبيهات",
    notifPrefsHint:
      "أوقف أي تذكير لا ترغب به. المُوقَف لا يظهر هنا ولا يُرسَل عبر البريد.",
    notifPrefsLink: "التفضيلات",
    notifBackToList: "رجوع للتنبيهات",
    notifMutedNote: "مُوقَف — لن تصلك هذه التذكيرات.",
    alertRenewal: "تذكيرات التجديد",
    alertCompliance: "تنبيهات الامتثال ودليل السياسات",
    alertAnomaly: "تنبيهات التعارضات",
    alertReview: "تذكيرات المراجعة",
    notifMasterTitle: "تنبيهات البريد الإلكتروني",
    notifMasterHint:
      "شغّل أو أوقف إشعارات البريد الإلكتروني الخاصة بالتذكيرات والتنبيهات.",
    notifMasterOn: "مُفعّلة",
    notifMasterOff: "مُوقَفة",
    notifAllOff: "التنبيهات مُوقَفة من الإعدادات.",
    notifMarkAllRead: "تعليم الكل كمقروء",
    fltUnread: "غير المقروءة",
    fltDone: "المنجزة",
    acNeedAction: "بحاجة لإجراء",
    acDone: "منجز",
    acAllClear: "لا مهام معلّقة — كل شيء مُنجز.",
    streamRenewals: "التجديدات",
    streamVerify: "التحقق",
    streamCompliance: "الامتثال",
    streamAnomaly: "التعارضات",
    taskAssignee: "المسؤول",
    taskUnassigned: "غير مُسنَد",
    taskTags: "الوسوم",
    taskAddTag: "أضف وسمًا…",
    taskComments: "التعليقات",
    taskNoComments: "لا تعليقات بعد.",
    taskAddComment: "اكتب تعليقًا…",
    commentHint: "اضغط Enter للإرسال · Alt+Enter لسطر جديد",
    taskSend: "إرسال",
    taskActivity: "سجل النشاط",
    taskNoActivity: "لا نشاط بعد.",
    taskMarkDone: "تعليم كمنجَز",
    taskDone: "منجَز",
    taskReopen: "إعادة فتح",
    taskViewContract: "عرض العقد",
    taskRelatedContract: "العقد المرتبط",
    taskOutcome: "الإجراء المتّخذ",
    taskOutcomePrompt: "سجّل ما تم لتحديث النظام وإنشاء الإجراء التالي:",
    taskNextStep: "الخطوة التالية في النظام",
    actOutcome: "سجّل الإجراء المتّخذ:",
    actDone: "علّم الإجراء كمنجَز",
    actReopen: "أعاد فتح الإجراء",
    actAssigned: "أسند الإجراء إلى",
    actUnassigned: "ألغى إسناد الإجراء",
    actTagAdd: "أضاف وسمًا:",
    actTagRemove: "أزال وسمًا:",
    actComment: "أضاف تعليقًا",
    notBuiltTitle: "ميزة قائمة في ساين إت",
    notBuiltBody:
      "هذه الميزة متوفّرة في منصة ساين إت، وهي خارج نطاق هذا النموذج الأولي الذي يركّز على «العقود».",
    valuesTab: "القيم المستخرجة",
    documentTab: "المستند",
    docReconstructed: "نص مُعاد بناؤه من البنود المستخرجة",
    docUploaded: "المستند الموقّع المرفوع",
    add: {
      title: "إضافة عقد موقّع",
      subtitle: "الصق نص العقد أو ارفع الملف الموقّع — سيقرأه ساين إت ويستخرج بنوده.",
      upload: "ارفع ملفًا (PDF أو نص)",
      uploadHint: "PDF أو TXT",
      orPaste: "أو الصق النص",
      placeholder: "الصق نص العقد الموقّع هنا…",
      analyze: "حلّل باستخدام ساين إت",
      analyzing: "ساين إت يقرأ المستند…",
      review: "راجع التفاصيل وأكّدها",
      aiFilled: "عبّأ ساين إت الحقول — يُرجى المراجعة قبل الحفظ.",
      aiFailed: "تعذّر الوصول للذكاء — أكمل التفاصيل يدويًا.",
      fTitle: "عنوان العقد",
      fParty: "الطرف الآخر",
      fType: "النوع",
      selectType: "— اختر النوع —",
      fValue: "القيمة (ر.س)",
      fEnd: "تاريخ الانتهاء",
      fNotice: "الإشعار (أيام)",
      fAutoRenew: "تجديد تلقائي",
      fRisk: "الخطورة",
      needTitle: "الرجاء إضافة عنوان للعقد.",
      save: "أضف العقد",
      cancel: "إلغاء",
      attached: "مُرفق",
    },
  },
  en: {
    dir: "ltr",
    name: "Signit",
    tag: "Post-signature contract intelligence",
    overview: "Overview",
    notifications: "Action Center",
    list: "All contracts",
    searchContracts: "Search contracts…",
    noMatches: "No matching contracts.",
    colName: "Name",
    colParty: "Counterparty",
    colActions: "Actions",
    reset: "Reset",
    colStatus: "Status",
    colStart: "Start date",
    colEnd: "End date",
    colAutoRenew: "Auto-renewal",
    colValue: "Value",
    colRisk: "Risk",
    stActive: "Active",
    stDraft: "Draft",
    stInactive: "Inactive",
    tagExpiring: "Expiring soon",
    contractsCount: "contracts",
    classification: "Classification",
    classConfidence: "Classification confidence",
    classAuto: "Auto-classified",
    classSpotcheck: "Spot-check",
    classQueue: "Human queue",
    classAutoHint: "High confidence (>95%) — auto-classified.",
    classSpotcheckHint: "Confidence 85–95% — auto-classified with a spot-check flag.",
    classQueueHint: "Low confidence (<85%) — awaiting human classification.",
    classManual: "You classified this",
    classManualHint: "You chose the type on upload — no review needed.",
    fltNeedsClass: "Needs classification review",
    autoOn: "Auto",
    autoOff: "Manual",
    fltStatus: "Status",
    fltType: "Type",
    fltAll: "All",
    rowsPerPage: "Rows per page",
    pageOf: "Page {n} of {m}",
    radar: "Obligation Radar",
    ask: "Ask Signit",
    askSuggestFor: "Suggested for this page",
    review: "Needs your eyes",
    legal: "Legal Counsel",
    proc: "Procurement / Ops",
    exec: "Executive",
    totalCommit: "Total contractual commitments",
    activeContracts: "Active contracts",
    next90: "Obligations in next 90 days",
    concentration: "Vendor concentration",
    pdpl: "PDPL compliance",
    exposure: "Exposure by category",
    catHint: "Tap a category to filter",
    upcoming: "Upcoming renewals",
    autoRenewRisk: "At risk of auto-renewal",
    noticeWindow: "Notice window",
    daysLeft: "days left",
    leverage: "Negotiation leverage",
    riskOverview: "Risk map",
    anomalies: "Anomalies flagged",
    byRisk: "Contracts by risk",
    liabilityExposure: "Liability exposure",
    jurisdiction: "Preferred jurisdiction",
    playbookDev: "Playbook deviations",
    playbookMet: "Meets the playbook",
    high: "High",
    medium: "Medium",
    low: "Low",
    verified: "Verified",
    needsReview: "Needs review",
    confidence: "Confidence",
    source: "Source clause",
    showSource: "Show source",
    askPlaceholder:
      "Ask your portfolio… e.g. which vendor contracts have a liability cap below 1M SAR?",
    thinking: "Signit is reading the contracts…",
    matches: "Matching contracts",
    noReview: "Nothing awaiting review — nicely done.",
    confirm: "Confirm",
    edit: "Edit",
    confirmed: "Confirmed",
    value: "Value",
    term: "Term",
    renewal: "Renewal",
    liability: "Liability cap",
    ip: "IP ownership",
    penalty: "Penalties",
    law: "Governing law",
    counterparty: "Counterparty",
    type: "Type",
    back: "Back",
    exportContract: "Export",
    editContract: "Edit",
    saveChanges: "Save changes",
    deleteContract: "Delete contract",
    confirmDelete: "Confirm delete?",
    none: "Not specified",
    vat: "VAT",
    open: "Open contract",
    riskFlag: "Risk flag",
    live: "Live AI",
    demo: "Demo",
    langBtn: "ع",
    types: {
      nda: "NDA",
      msa: "MSA",
      sow: "SOW",
      lease: "Lease",
      employment: "Employment",
      po: "Purchase Order",
      licence: "Licence Agreement",
    },
    filterCap: "Liability cap < 1M SAR",
    filterRenew: "Renews in 90 days",
    filterUploaded: "Uploaded",
    clear: "All",
    trustNote:
      "Every AI-extracted value is linked to its source clause and a confidence score. Tap any value to see the original text.",
    hijri: "AH",
    greg: "CE",
    newContract: "New contract",
    navHome: "Home",
    navDocuments: "Documents",
    navContracts: "Contracts",
    navTemplates: "Templates",
    navReports: "Insights",
    settings: "Settings",
    getHelp: "Get help",
    accMyAccount: "My Account",
    accBilling: "Plan & Billing",
    accLogout: "Logout",
    accDark: "Dark mode",
    accLight: "Light mode",
    viewAs: "View as",
    prototype: "Prototype",
    planLabel: "Plan",
    resetDemo: "Reset prototype data",
    resetDemoDone: "Demo reset to its original state",
    planFree: "Free",
    planPaid: "Pro",
    proOnly: "Pro feature",
    proLockPersona: "Other lenses are available on Pro",
    upgradePro: "Upgrade to Pro",
    freeBanner: "You're on the Free plan",
    freeContractsOf: "Showing {n} of {m} contracts",
    freeMoreLocked: "{n} more contracts available on Pro",
    proGateTitle: "Pro feature",
    proGateBody:
      "Managing notifications as actions (assignees, comments, status, activity log) is available on the Pro plan.",
    extractProNote:
      "Full extraction (liability, penalties, law, PDPL) and confidence scores are on Pro.",
    dashProLabel: "Full exec dashboard",
    dashProSub: "Concentration, exposure & compliance",
    radarProNote:
      "The full radar (Hijri + notice alerts) is on Pro — this is the basic list.",
    complianceProNote:
      "Compliance-check setup (PDPL / ZATCA / playbook) is a Pro feature.",
    anomalyProChip: "Anomaly detection — Pro",
    riskTab: "Risk",
    riskTitle: "Contract risk score",
    riskDimsTitle: "Risk dimensions",
    riskLow: "0 low",
    riskHigh: "100 high",
    riskBandHigh: "HIGH RISK",
    riskBandMed: "MEDIUM RISK",
    riskBandLow: "LOW RISK",
    riskProNote: "Risk scoring and playbook comparison are a Pro feature.",
    pbVs: "vs",
    dimLiability: "Liability exposure",
    dimLiabilityInd: "Cap below 1M or below contract value",
    dimTermination: "Termination risk",
    dimTerminationInd: "Termination for convenience, short notice",
    dimIp: "IP risk",
    dimIpInd: "IP assigned to customer without carve-outs",
    dimIndemnity: "Indemnification imbalance",
    dimIndemnityInd: "One-sided indemnification",
    dimAutorenew: "Auto-renewal risk",
    dimAutorenewInd: "Short notice window to prevent renewal",
    dimLaw: "Governing law",
    dimLawInd: "Mandatory arbitration in counterparty venue",
    pbLiability: "Liability cap",
    pbNotice: "Auto-renewal notice",
    pbJurisdiction: "Jurisdiction",
    pbPdpl: "Data processing (PDPL)",
    pbIndemnity: "Indemnification",
    obTab: "Obligations",
    obCalTitle: "Obligation calendar",
    obIntro:
      "Everything that needs action in one place — renewals, payments, deliverables, compliance, notices and reviews — ordered by due date, with the owner notified and escalation to their manager if missed.",
    obPayment: "Payment",
    obDeliverable: "Deliverable",
    obCompliance: "Compliance",
    obNotice: "Notice",
    obInsurance: "Insurance",
    obRenewal: "Renewal",
    obReview: "Review",
    tierOverdue: "Overdue",
    tierD1: "Within 1 day",
    tierD7: "Within 7 days",
    tierD30: "Within 30 days",
    tierLater: "Later",
    obOwner: "Owner",
    obEscalate: "Escalates to",
    obAlertsVia: "Alert via email & Slack",
    obSimNote: "Alerts are simulated in this prototype.",
    obEmpty: "No obligations tracked.",
    ssTab: "Semantic search",
    radarTab: "Contradiction radar",
    radarIntro:
      "The radar flags contracts whose terms conflict with each other across the portfolio — data residency, liability floor, renewal-notice window, and jurisdiction — exposing where the organisation holds two positions it can't both defend. Click any contract to open it.",
    radarRec: "Recommendation",
    radarEmptyTitle: "No contradictions in the portfolio",
    radarEmpty:
      "Your active contracts are consistent across the monitored dimensions. Any new conflict will appear here as soon as a contract deviates from the rest.",
    radarLogAction: "Log the action",
    radarAssignPlaceholder: "Assign to a team",
    radarReopen: "Reopen",
    radarResolvedCount: "resolved",
    radarRelated: "Conflicting contracts",
    radarConflictCards: "conflicting contracts",
    askClauseHint: "Select text to explain",
    askClauseCta: "Explain this clause",
    askClauseStandard: "Standard vs. your playbook",
    askClauseWhy: "Why it matters",
    askClauseLinked: "Linked to an extracted clause",
    notifSettingsTab: "Notification settings",
    complianceTab: "Compliance & policies",
    notifSettingsIntro: "Choose how alerts reach you and which types you want to receive.",
    notifUnreadOnly: "Unread only",
    notifNoUnread: "No unread notifications",
    freeContractsNote: "Free · 3 contracts",
    makeRoomTitle: "Make room for a new contract",
    makeRoomBody: "Your free plan includes 3 active contracts. Delete one to add a new one.",
    makeRoomUpgrade: "Or upgrade for unlimited contracts",
    actReview: "Review",
    actNotify: "Notify",
    actNegotiate: "Negotiate",
    actClaim: "Claim",
    actComplete: "Complete",
    actVerify: "Verify",
    actDetails: "Details",
    ssTitle: "Semantic contract search",
    ssIntro: "Search by meaning, not exact words: type your question in plain language and the system surfaces the relevant contracts and clauses even when their wording differs from yours.",
    ssPlaceholder: "Search by meaning… e.g. liability obligations",
    ssSim: "sim",
    ssSimNote:
      "Simulates the embedding pipeline (Query → Embedding → Vector DB → Similarity) without a live embedding model.",
    ssNoResults: "No semantic matches — try another phrasing (liability, renewal, data, payment, law).",
    ssStep1: "Query",
    ssStep2: "Embedding model",
    ssStep3: "Vector database",
    ssStep4: "Similarity match",
    freeUploadTitle: "Free upload limit reached",
    freeUploadBody:
      "The Free plan allows uploading 3 contracts. Upgrade to Pro for unlimited uploads.",
    emailProNote: "Email notifications are available on the Pro plan.",
    planCompare: "Compare plans",
    cmpTitle: "Compare plans",
    cmpSubtitle: "See what you're missing on Free",
    cmpFeature: "Feature",
    keepFree: "Keep free version",
    cmpLenses: "Persona lenses",
    cmpUploads: "Contract ingestion",
    cmpAsk: "Ask Signit (Q&A)",
    cmpExtraction: "AI field extraction",
    valExecOnly: "Single lens only",
    valAllLenses: "All three",
    valUploadsFree: "Manual — up to 3",
    valUploadsPro: "Unlimited + legacy migration",
    valAskSingle: "Your uploaded contracts only",
    valAskPortfolio: "Whole portfolio",
    secIngest: "Ingestion & extraction",
    secCompliance: "Compliance",
    secObligations: "Obligations & lenses",
    secIntel: "Portfolio intelligence",
    cmpSourceClauses: "Source clause for each value",
    cmpPdpl: "Data protection (PDPL)",
    cmpZatca: "Invoicing & penalties (ZATCA)",
    cmpAnomaly: "Clause anomaly detection",
    cmpRenewals: "Renewal tracking",
    cmpDashboard: "Exec dashboard (concentration/exposure/board export)",
    cmpWorkflow: "Action workflow (team assignment, notes)",
    cmpCompanyDocs: "Company policy documents (upload & review)",
    cmpActionWindow: "Action Center time horizon",
    valExtractFree: "Basic: party, value, date",
    valExtractPro: "Full schema + confidence",
    valPdplFree: "Contract count only",
    valPdplPro: "Exposure scanner + article mapping",
    valRenewFree: "Basic Gregorian list",
    valRenewPro: "Radar + notice alerts",
    valActionWindowFree: "Overdue + 7 days",
    valActionWindowPro: "Full 30+ day calendar",
    setTitle: "Compliance & review setup",
    setIntro:
      "Choose what every document is reviewed against: local regulations and your company's playbook rules. Whatever you enable is applied automatically across the portfolio.",
    setRegulations: "Local regulations",
    setPlaybook: "Playbook rules",
    setCompanyDocs: "Company playbook documents",
    setCompanyDocsHint:
      "Upload your company's policies (PDF or text) — contracts are reviewed against them.",
    setUpload: "Upload documents",
    setNoDocs: "No documents uploaded yet.",
    setAppliedNote: "These settings apply to every document's review across the portfolio.",
    remove: "Remove",
    notifCenter: "Notifications",
    notifOpen: "Open notifications",
    notifEmpty: "No notifications — you're all caught up.",
    notifPrefsTitle: "Notification preferences",
    notifPrefsHint:
      "Turn off any reminder you don't want. Muted ones don't show here and aren't emailed.",
    notifPrefsLink: "Preferences",
    notifBackToList: "Back to notifications",
    notifMutedNote: "Off — you won't get these reminders.",
    alertRenewal: "Renewal reminders",
    alertCompliance: "Compliance & playbook alerts",
    alertAnomaly: "Anomaly alerts",
    alertReview: "Review reminders",
    notifMasterTitle: "Email notifications",
    notifMasterHint:
      "Turn email notifications for reminders and alerts on or off.",
    notifMasterOn: "On",
    notifMasterOff: "Off",
    notifAllOff: "Notifications are turned off in Settings.",
    notifMarkAllRead: "Mark all read",
    fltUnread: "Unread",
    fltDone: "Done",
    acNeedAction: "need action",
    acDone: "done",
    acAllClear: "No open tasks — you're all caught up.",
    streamRenewals: "Renewals",
    streamVerify: "Verify",
    streamCompliance: "Compliance",
    streamAnomaly: "Anomalies",
    taskAssignee: "Assignee",
    taskUnassigned: "Unassigned",
    taskTags: "Tags",
    taskAddTag: "Add tag…",
    taskComments: "Comments",
    taskNoComments: "No comments yet.",
    taskAddComment: "Write a comment…",
    commentHint: "Press Enter to send · Alt+Enter for a new line",
    taskSend: "Send",
    taskActivity: "Activity log",
    taskNoActivity: "No activity yet.",
    taskMarkDone: "Mark as done",
    taskDone: "Done",
    taskReopen: "Reopen",
    taskViewContract: "View contract",
    taskRelatedContract: "Related contract",
    taskOutcome: "Action taken",
    taskOutcomePrompt: "Log what happened so the system updates and schedules the next action:",
    taskNextStep: "System's next step",
    actOutcome: "logged the action taken:",
    actDone: "marked the action done",
    actReopen: "reopened the action",
    actAssigned: "assigned the action to",
    actUnassigned: "unassigned the action",
    actTagAdd: "added a tag:",
    actTagRemove: "removed a tag:",
    actComment: "added a comment",
    notBuiltTitle: "An existing Signit feature",
    notBuiltBody:
      "This lives in the Signit product and is outside the scope of this prototype, which focuses on Contracts.",
    valuesTab: "Extracted values",
    documentTab: "Document",
    docReconstructed: "Text reconstructed from the extracted clauses",
    docUploaded: "Uploaded signed document",
    add: {
      title: "Add a signed contract",
      subtitle:
        "Paste the contract text or upload the signed file — Signit reads it and extracts the terms.",
      upload: "Upload a file (PDF or text)",
      uploadHint: "PDF or TXT",
      orPaste: "or paste the text",
      placeholder: "Paste the signed contract's text here…",
      analyze: "Analyze with Signit",
      analyzing: "Signit is reading the document…",
      review: "Review & confirm the details",
      aiFilled: "Signit filled these in — please review before saving.",
      aiFailed: "Couldn't reach the AI — fill the details manually.",
      fTitle: "Contract title",
      fParty: "Counterparty",
      fType: "Type",
      selectType: "— Select type —",
      fValue: "Value (SAR)",
      fEnd: "End date",
      fNotice: "Notice (days)",
      fAutoRenew: "Auto-renews",
      fRisk: "Risk",
      needTitle: "Please add a contract title.",
      save: "Add contract",
      cancel: "Cancel",
      attached: "attached",
    },
  },
};

/** Localised label for a fact key; falls back to the raw key. */
export function factLabel(lang: Lang, key: FactKey): string {
  const d = T[lang] as unknown as Record<string, string>;
  return d[key] ?? key;
}
