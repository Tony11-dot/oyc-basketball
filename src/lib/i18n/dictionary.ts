import type { Locale, Localized } from "../types";

// UI string dictionary. Page *content* (hero copy, teams, players) lives in the
// data layer and is localised there; this covers chrome, labels and buttons.

export interface Dict {
  dir: "rtl" | "ltr";
  langName: string;
  nav: {
    home: string;
    teams: string;
    games: string;
    highlights: string;
    gallery: string;
    historic: string;
    staff: string;
    volunteers: string;
    register: string;
    contact: string;
  };
  hero: { badge: string; cta: string; secondary: string };
  teams: {
    eyebrow: string;
    heading: string;
    subheading: string;
    empty: string;
    players: string;
    matches: string;
    noPlayers: string;
    noMatches: string;
    vs: string;
    at: string;
    viewIbba: string;
    teamIbba: string;
    open: string;
    coaches: string;
    noCoaches: string;
    responsible: string;
    phone: string;
  };
  games: {
    eyebrow: string; heading: string; subheading: string; empty: string;
    filterTeam: string; filterPlayer: string; allTeams: string; allPlayers: string;
    upcoming: string; past: string; vs: string; at: string; viewIbba: string;
    responsible: string; phone: string;
  };
  coach: {
    loginTitle: string; loginSubtitle: string; idLabel: string; idPlaceholder: string;
    signIn: string; signingIn: string; wrong: string; error: string; signOut: string;
    myTeamsTitle: string; myTeamsSubtitle: string; noTeams: string; takeAttendance: string;
    backToTeams: string; dateLabel: string; present: string; absent: string;
    markAllPresent: string; clearAll: string; submit: string; submitting: string;
    submitted: string; noPlayers: string; lastTaken: string; loadError: string;
  };
  historic: { eyebrow: string };
  staff: { eyebrow: string; heading: string; subheading: string; empty: string };
  volunteers: { eyebrow: string; heading: string; subheading: string; empty: string };
  highlights: { eyebrow: string; heading: string; subheading: string; empty: string };
  gallery: { eyebrow: string; heading: string; subheading: string };
  register: {
    eyebrow: string;
    heading: string;
    subheading: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    notes: string;
    notesOptional: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    signCta: string;
    signHelp: string;
    registerAnother: string;
    perks: string[];
    errors: { required: string; phone: string; email: string; generic: string };
    form: {
      sectionPlayer: string; sectionParents: string; sectionContact: string; sectionClub: string; sectionSign: string;
      player: string; idNumber: string; birthDate: string; phonePlayer: string;
      father: string; mother: string; phoneFather: string; phoneMother: string;
      address: string; school: string; grade: string;
      jerseySize: string; jerseyPlaceholder: string;
      payment: string; paymentPlaceholder: string; paymentCash: string; paymentCheck: string; paymentCard: string;
      paymentWithin7Days: string;
      cardTitle: string; cardName: string; cardNumber: string; cardExpiry: string; cardCvc: string;
      payNow: string; paySecureNote: string; payPending: string;
      guardian: string; date: string;
      signature: string; signatureHint: string; clear: string;
      consent: string; feeNote: string; optional: string;
    };
  };
  footer: { contact: string; address: string; directions: string; follow: string; rights: string; adminLink: string };
  admin: {
    loading: string;
    viewSite: string;
    signOut: string;
    save: string;
    saving: string;
    refresh: string;
    actions: { add: string; edit: string; delete: string; cancel: string; search: string };
    nav: { overview: string; registrations: string; teams: string; players: string; coaches: string; attendance: string; content: string; sections: string; settings: string };
    players: { add: string; none: string; search: string; name: string; addNew: string; pickerPlaceholder: string };
    coaches: { add: string; none: string; search: string; name: string; idNumber: string; phone: string; addNew: string; pickerPlaceholder: string };
    attendance: {
      subtitle: string; pickTeam: string; backToTeams: string; noTeams: string;
      present: string; absent: string; notMarked: string; player: string; number: string;
      takenBy: string; noRecords: string; gridHint: string; calendar: string; closeCalendar: string;
      pickDate: string; dayNoRecords: string; dateColumn: string; rate: string;
    };
    settings: {
      title: string;
      subtitle: string;
      current: string;
      newPass: string;
      confirm: string;
      save: string;
      saved: string;
      mismatch: string;
      tooShort: string;
      wrongCurrent: string;
    };
    login: {
      title: string;
      subtitle: string;
      passwordLabel: string;
      signIn: string;
      signingIn: string;
      wrong: string;
      error: string;
      demo: string;
      showPassword: string;
      hidePassword: string;
    };
    titles: {
      overview: string;
      overviewSub: string;
      registrations: string;
      registrationsSub: string;
      teams: string;
      teamsSub: string;
      players: string;
      playersSub: string;
      coaches: string;
      coachesSub: string;
      attendance: string;
      attendanceSub: string;
      content: string;
      contentSub: string;
    };
    contentTabs: { hero: string; highlights: string; gallery: string; historic: string; staff: string; volunteers: string; register: string; blocks: string; footer: string; backgrounds: string };
    people: { addStaff: string; addVolunteer: string; emptyStaff: string; emptyVolunteers: string; name: string; role: string; photo: string };
    historicEditor: { title: string; body: string; image: string };
    registerEditor: { eyebrow: string; heading: string; subheading: string; feeNote: string; consent: string; perks: string; addPerk: string; feeAmount: string; feeAmountHint: string };
    preview: { label: string };
    toasts: { saved: string; saveError: string };
    imageUpload: { upload: string; replace: string; remove: string; uploading: string; failed: string };
    positioner: { label: string; hint: string; reset: string; frameShape: string; align: string };
    sections: {
      subtitle: string;
      tip: string;
      shown: string;
      hidden: string;
      showHint: string;
      hideHint: string;
      moveUp: string;
      moveDown: string;
    };
    gallery: { add: string; empty: string; caption: string };
    fields: {
      headline: string;
      subtitle: string;
      body: string;
      phone: string;
      email: string;
      address: string;
      socialLinks: string;
      addLink: string;
      linkLabel: string;
    };
    team: {
      none: string;
      addTitle: string;
      cover: string;
      coverHint: string;
      name: string;
      description: string;
      detailBg: string;
      detailBgHint: string;
      ibbaLink: string;
      ibbaLinkHint: string;
      show: string;
      deleteTitle: string;
      deleteWarn: string;
      players: string;
      playersHint: string;
      selectExisting: string;
      addExisting: string;
      addNew: string;
      newPlayerName: string;
      number: string;
      position: string;
      detach: string;
      noPlayers: string;
      coaches: string;
      coachesHint: string;
      noCoaches: string;
      addNewCoach: string;
      coachId: string;
      coachPhone: string;
      matches: string;
      matchesHint: string;
      addMatch: string;
      opponent: string;
      opponentLogo: string;
      matchDate: string;
      matchWhere: string;
      contactName: string;
      contactNameHint: string;
      contactPhone: string;
      matchIbba: string;
      removeMatch: string;
      noMatches: string;
      roster: string;
      rosterHint: string;
    };
    highlight: {
      subtitle: string;
      add: string;
      none: string;
      video: string;
      videoHint: string;
      embed: string;
      embedHint: string;
      or: string;
      poster: string;
      caption: string;
    };
    reg: {
      none: string;
      name: string;
      phone: string;
      email: string;
      status: string;
      date: string;
      details: string;
      notes: string;
      markSigned: string;
      markNew: string;
      delete: string;
      deleteConfirm: string;
      allStatuses: string;
      viewPdf: string;
      noPdf: string;
    };
    status: { new: string; signed: string; archived: string };
    overview: { totalRegs: string; thisMonth: string; teams: string; players: string; latest: string; viewAll: string; none: string };
  };
}

export const dictionaries: Record<Locale, Dict> = {
  ar: {
    dir: "rtl",
    langName: "العربية",
    nav: { home: "الرئيسية", teams: "الفرق", games: "المباريات", highlights: "أبرز اللقطات", gallery: "الصور", historic: "لمحة تاريخية", staff: "الطاقم", volunteers: "المتطوّعون", register: "التسجيل", contact: "تواصل" },
    hero: { badge: "النادي الأرثوذكسي لكرة السلة — الناصرة", cta: "سجّل الآن", secondary: "شاهد الفرق" },
    teams: {
      eyebrow: "فرقنا",
      heading: "الفرق",
      subheading: "تعرّف على فرقنا، لاعبيها ومبارياتها.",
      empty: "لا توجد فرق لعرضها حالياً.",
      players: "اللاعبون",
      matches: "المباريات",
      noPlayers: "لم تتم إضافة لاعبين بعد.",
      noMatches: "لا توجد مباريات مجدولة بعد.",
      vs: "ضد",
      at: "في",
      viewIbba: "صفحة IBBA",
      teamIbba: "صفحة الفريق على IBBA",
      open: "التفاصيل",
      coaches: "المدرّبون",
      noCoaches: "لم تتم إضافة مدرّبين بعد.",
      responsible: "المسؤول",
      phone: "الهاتف",
    },
    games: {
      eyebrow: "الجدول",
      heading: "المباريات",
      subheading: "كل مبارياتنا مرتّبة حسب التاريخ — من الأقرب إلى الأبعد.",
      empty: "لا توجد مباريات مجدولة بعد.",
      filterTeam: "حسب الفريق",
      filterPlayer: "حسب اللاعب",
      allTeams: "كل الفرق",
      allPlayers: "كل اللاعبين",
      upcoming: "القادمة",
      past: "السابقة",
      vs: "ضد",
      at: "في",
      viewIbba: "صفحة IBBA",
      responsible: "المسؤول",
      phone: "الهاتف",
    },
    coach: {
      loginTitle: "بوّابة المدرّبين",
      loginSubtitle: "أدخل رقم هويّتك لتسجيل الحضور.",
      idLabel: "رقم الهويّة",
      idPlaceholder: "رقم هويّتك",
      signIn: "دخول",
      signingIn: "جارٍ الدخول…",
      wrong: "رقم هويّة غير معروف. تواصل مع الإدارة.",
      error: "حدث خطأ ما. حاول مجدداً.",
      signOut: "خروج",
      myTeamsTitle: "فرقي",
      myTeamsSubtitle: "اختر فريقاً لتسجيل الحضور.",
      noTeams: "لا توجد فرق مرتبطة بك بعد. تواصل مع الإدارة.",
      takeAttendance: "تسجيل الحضور",
      backToTeams: "← العودة إلى الفرق",
      dateLabel: "التاريخ",
      present: "حاضر",
      absent: "غائب",
      markAllPresent: "تحديد الكل حاضر",
      clearAll: "مسح الكل",
      submit: "حفظ الحضور",
      submitting: "جارٍ الحفظ…",
      submitted: "تم حفظ الحضور",
      noPlayers: "لا يوجد لاعبون في هذا الفريق.",
      lastTaken: "آخر تحديث",
      loadError: "تعذّر التحميل. حاول مجدداً.",
    },
    historic: { eyebrow: "من تاريخنا" },
    staff: { eyebrow: "طاقمنا", heading: "الطاقم", subheading: "المدرّبون والإداريون خلف النادي.", empty: "لم تتم إضافة أعضاء الطاقم بعد." },
    volunteers: { eyebrow: "أيادٍ بيضاء", heading: "المتطوّعون", subheading: "من يمنحون وقتهم لخدمة النادي.", empty: "لم تتم إضافة متطوّعين بعد." },
    highlights: { eyebrow: "لقطات", heading: "أبرز اللقطات", subheading: "أجمل اللحظات من الملعب.", empty: "لا توجد مقاطع بعد." },
    gallery: { eyebrow: "من أجوائنا", heading: "الصور", subheading: "لحظات من المباريات والحياة في النادي." },
    register: {
      eyebrow: "انضمّ إلينا",
      heading: "التسجيل في النادي",
      subheading: "املأ بياناتك ووقّع استمارة التسجيل هنا مباشرة.",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      notes: "ملاحظات",
      notesOptional: "ملاحظات (اختياري)",
      submit: "إرسال التسجيل",
      submitting: "جارٍ الإرسال…",
      successTitle: "تم استلام تسجيلك!",
      successBody: "أرسلنا تأكيداً إلى بريدك الإلكتروني، وستتواصل معك إدارة النادي قريباً.",
      signCta: "فتح استمارة التوقيع",
      signHelp: "وقّع داخل الإطار أدناه لإكمال التسجيل.",
      registerAnother: "تسجيل شخص آخر",
      perks: ["تدريبات منتظمة", "مباريات في دوري IBBA", "روح أرثوذكسية وأخوّة"],
      errors: { required: "حقل مطلوب", phone: "رقم هاتف غير صالح", email: "بريد إلكتروني غير صالح", generic: "حدث خطأ. حاول مجدداً." },
      form: {
        sectionPlayer: "بيانات اللاعب/ة", sectionParents: "بيانات الوالدين", sectionContact: "العنوان والمدرسة", sectionClub: "النادي", sectionSign: "الإقرار والتوقيع",
        player: "اسم اللاعب/ة", idNumber: "رقم الهويّة", birthDate: "تاريخ الميلاد", phonePlayer: "هاتف اللاعب/ة",
        father: "اسم الأب", mother: "اسم الأم", phoneFather: "هاتف الأب", phoneMother: "هاتف الأم",
        address: "العنوان", school: "المدرسة", grade: "الصف",
        jerseySize: "مقاس الزيّ الرياضي", jerseyPlaceholder: "— اختر المقاس —",
        payment: "طريقة دفع الرسوم", paymentPlaceholder: "— طريقة الدفع —", paymentCash: "نقداً", paymentCheck: "شيكات", paymentCard: "بطاقة اعتماد",
        paymentWithin7Days: "يُرجى تسديد الرسوم خلال 7 أيام من تاريخ التسجيل.",
        cardTitle: "تفاصيل البطاقة", cardName: "الاسم على البطاقة", cardNumber: "رقم البطاقة", cardExpiry: "تاريخ الانتهاء", cardCvc: "الرمز السرّي",
        payNow: "ادفع الآن", paySecureNote: "تتم المعالجة عبر بوّابة دفع آمنة؛ لا نحتفظ ببيانات بطاقتك.", payPending: "سيُكمَّل الدفع بعد الإرسال.",
        guardian: "اسم وليّ الأمر", date: "التاريخ",
        signature: "توقيع وليّ الأمر", signatureHint: "وقّع بإصبعك أو الفأرة داخل الإطار", clear: "مسح",
        consent: "أُقرّ بأنني وليّ أمر اللاعب/ة، وأوافق على شروط التسجيل، وعلى نشر صور ابني/ابنتي ضمن فعاليات الجمعية، وأن التسجيل مشروط بفحص طبّي ودفع الرسوم.",
        feeNote: "رسوم التسجيل السنوية: 3,500 ش.ج (لا تشمل 30 ش.ج لاتحاد كرة السلة). التسجيل مشروط بتسديد رسوم السنوات السابقة.",
        optional: "اختياري",
      },
    },
    footer: { contact: "تواصل", address: "العنوان", directions: "الاتجاهات عبر Waze", follow: "تابعنا", rights: "جميع الحقوق محفوظة.", adminLink: "الإدارة" },
    admin: {
      loading: "جارٍ التحميل…",
      viewSite: "عرض الموقع",
      signOut: "تسجيل الخروج",
      save: "حفظ التغييرات",
      saving: "جارٍ الحفظ…",
      refresh: "تحديث",
      actions: { add: "إضافة", edit: "تعديل", delete: "حذف", cancel: "إلغاء", search: "بحث" },
      nav: { overview: "نظرة عامة", registrations: "التسجيلات", teams: "الفرق", players: "اللاعبون", coaches: "المدرّبون", attendance: "الحضور", content: "المحتوى", sections: "الأقسام", settings: "الإعدادات" },
      players: { add: "إضافة لاعب", none: "لا يوجد لاعبون في القائمة بعد.", search: "ابحث عن لاعب…", name: "الاسم", addNew: "+ إنشاء لاعب جديد", pickerPlaceholder: "ابحث أو أضف لاعباً…" },
      coaches: { add: "إضافة مدرّب", none: "لا يوجد مدرّبون بعد.", search: "ابحث عن مدرّب…", name: "الاسم", idNumber: "رقم الهويّة", phone: "الهاتف", addNew: "+ إنشاء مدرّب جديد", pickerPlaceholder: "ابحث أو أضف مدرّباً…" },
      attendance: {
        subtitle: "اختر فريقاً لعرض حضور لاعبيه عبر التواريخ.",
        pickTeam: "اختر فريقاً",
        backToTeams: "← العودة إلى الفرق",
        noTeams: "لا توجد فرق بعد.",
        present: "حاضر",
        absent: "غائب",
        notMarked: "—",
        player: "اللاعب",
        number: "الرقم",
        takenBy: "سجّله",
        noRecords: "لا توجد سجلات حضور لهذا الفريق بعد.",
        gridHint: "كل عمود هو تاريخ تسجيل حضور.",
        calendar: "📅 تقويم",
        closeCalendar: "إغلاق التقويم",
        pickDate: "اختر تاريخاً لعرض حضوره",
        dayNoRecords: "لا يوجد حضور مسجّل في هذا اليوم.",
        dateColumn: "التاريخ",
        rate: "النسبة",
      },
      settings: {
        title: "الإعدادات",
        subtitle: "تغيير كلمة مرور الإدارة.",
        current: "كلمة المرور الحالية",
        newPass: "كلمة مرور جديدة",
        confirm: "تأكيد كلمة المرور",
        save: "تحديث كلمة المرور",
        saved: "تم تحديث كلمة المرور",
        mismatch: "كلمتا المرور غير متطابقتين",
        tooShort: "كلمة المرور قصيرة جداً (٤ أحرف على الأقل)",
        wrongCurrent: "كلمة المرور الحالية غير صحيحة",
      },
      login: {
        title: "دخول الإدارة",
        subtitle: "أدخل كلمة مرور الإدارة للمتابعة.",
        passwordLabel: "كلمة المرور",
        signIn: "دخول",
        signingIn: "جارٍ الدخول…",
        wrong: "كلمة مرور خاطئة. حاول مجدداً.",
        error: "حدث خطأ ما. حاول مجدداً.",
        demo: "كلمة مرور تجريبية:",
        showPassword: "إظهار كلمة المرور",
        hidePassword: "إخفاء كلمة المرور",
      },
      titles: {
        overview: "لوحة التحكم",
        overviewSub: "نظرة عامة على التسجيلات والفرق.",
        registrations: "التسجيلات",
        registrationsSub: "عرض من سجّل في النادي ومتابعة حالة التوقيع.",
        teams: "الفرق",
        teamsSub: "أنشئ الفرق وأضف اللاعبين والمباريات وروابط IBBA.",
        players: "اللاعبون",
        playersSub: "القائمة العامة لكل اللاعبين. أضف، عدّل أو احذف؛ تُستخدم في كل الفرق.",
        coaches: "المدرّبون",
        coachesSub: "القائمة العامة للمدرّبين. أضف رقم الهويّة والهاتف؛ تُستخدم في كل الفرق وللدخول.",
        attendance: "الحضور",
        attendanceSub: "تابع حضور اللاعبين حسب الفريق والتاريخ.",
        content: "المحتوى",
        contentSub: "تحرير النصوص والخطوط والصور. تتحدث المعاينة فوراً؛ تُنشر التغييرات عند الحفظ.",
      },
      contentTabs: { hero: "الرئيسية", highlights: "أبرز اللقطات", gallery: "الصور", historic: "لمحة تاريخية", staff: "الطاقم", volunteers: "المتطوّعون", register: "التسجيل", blocks: "بلوكات", footer: "التذييل", backgrounds: "الخلفيات" },
      people: { addStaff: "إضافة عضو طاقم", addVolunteer: "إضافة متطوّع", emptyStaff: "لم تتم إضافة أعضاء الطاقم بعد.", emptyVolunteers: "لم تتم إضافة متطوّعين بعد.", name: "الاسم", role: "الدور", photo: "الصورة" },
      historicEditor: { title: "العنوان", body: "النص", image: "الصورة" },
      registerEditor: { eyebrow: "تمهيد", heading: "العنوان", subheading: "العنوان الفرعي", feeNote: "ملاحظة الرسوم", consent: "نص الإقرار", perks: "المزايا", addPerk: "إضافة ميزة", feeAmount: "قيمة الرسوم (₪)", feeAmountHint: "المبلغ الذي يُدفع بالبطاقة" },
      preview: { label: "معاينة حية — تتحدث عند الحفظ" },
      toasts: { saved: "تم الحفظ — ظاهر على الموقع", saveError: "تعذّر الحفظ" },
      imageUpload: { upload: "رفع صورة", replace: "استبدال الصورة", remove: "إزالة", uploading: "جارٍ الرفع…", failed: "فشل الرفع" },
      positioner: { label: "تموضع الصورة", hint: "اسحب الصورة لتأطيرها", reset: "إعادة ضبط", frameShape: "شكل الإطار:", align: "محاذاة:" },
      sections: {
        subtitle: "إظهار/إخفاء الأقسام وإعادة ترتيبها. يؤثر على الصفحة وعلى ألسنة التنقّل.",
        tip: "نصيحة: إخفاء التسجيل أو التواصل يزيلهما من الموقع — يُفضَّل إبقاؤهما ظاهرين.",
        shown: "ظاهر",
        hidden: "مخفي",
        showHint: "مخفي — اضغط للإظهار",
        hideHint: "ظاهر — اضغط للإخفاء",
        moveUp: "تحريك للأعلى",
        moveDown: "تحريك للأسفل",
      },
      gallery: { add: "إضافة صورة", empty: "لا توجد صور بعد. أضف صوراً للكاروسيل.", caption: "تعليق (اختياري)" },
      fields: {
        headline: "العنوان الرئيسي",
        subtitle: "العنوان الفرعي",
        body: "النص",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        address: "العنوان",
        socialLinks: "روابط التواصل",
        addLink: "إضافة رابط",
        linkLabel: "اسم الرابط",
      },
      team: {
        none: "لا توجد فرق بعد.",
        addTitle: "إضافة فريق",
        cover: "صورة الفريق",
        coverHint: "تظهر على البطاقة",
        name: "اسم الفريق",
        description: "وصف",
        detailBg: "خلفية التفاصيل",
        detailBgHint: "تظهر بملء الشاشة عند فتح الفريق",
        ibbaLink: "رابط IBBA للفريق",
        ibbaLinkHint: "رابط صفحة الفريق على موقع IBBA",
        show: "إظهار الفريق على الموقع",
        deleteTitle: "حذف الفريق",
        deleteWarn: "حذف؟ لن يظهر على الموقع. اللاعبون يبقون في القائمة العامة.",
        players: "اللاعبون",
        playersHint: "أضف لاعباً موجوداً أو أنشئ لاعباً جديداً فوراً",
        selectExisting: "اختر لاعباً موجوداً…",
        addExisting: "إضافة",
        addNew: "+ لاعب جديد",
        newPlayerName: "اسم اللاعب الجديد",
        number: "الرقم",
        position: "المركز",
        detach: "إزالة من الفريق",
        noPlayers: "لم تتم إضافة لاعبين بعد.",
        coaches: "المدرّبون",
        coachesHint: "أضف مدرّباً موجوداً أو أنشئ مدرّباً جديداً فوراً",
        noCoaches: "لم تتم إضافة مدرّبين بعد.",
        addNewCoach: "+ مدرّب جديد",
        coachId: "رقم الهويّة",
        coachPhone: "الهاتف",
        matches: "المباريات",
        matchesHint: "ضد من، متى، أين، المسؤول، ورابط IBBA",
        addMatch: "+ إضافة مباراة",
        opponent: "الخصم",
        opponentLogo: "شعار الخصم",
        matchDate: "التاريخ والوقت",
        matchWhere: "المكان",
        contactName: "المسؤول",
        contactNameHint: "الشخص الذي يُراجَع لدى الفريق الخصم",
        contactPhone: "هاتف المسؤول",
        matchIbba: "رابط IBBA للمباراة",
        removeMatch: "إزالة",
        noMatches: "لا مباريات بعد.",
        roster: "القائمة العامة للاعبين",
        rosterHint: "تظهر هنا كل اللاعبين؛ احذف لاعباً لإزالته من كل الفرق.",
      },
      highlight: {
        subtitle: "أضف مقاطع الفيديو — ملف مرفوع أو رابط يوتيوب/إنستغرام.",
        add: "إضافة مقطع",
        none: "لا توجد مقاطع بعد.",
        video: "ملف فيديو",
        videoHint: "ارفع mp4/webm، أو الصق رابط فيديو مباشر",
        embed: "رابط يوتيوب / إنستغرام",
        embedHint: "الصق رابط المشاهدة وسيُضمَّن",
        or: "أو",
        poster: "صورة مصغّرة (اختياري)",
        caption: "تعليق",
      },
      reg: {
        none: "لا توجد تسجيلات بعد.",
        name: "الاسم",
        phone: "الهاتف",
        email: "البريد",
        status: "الحالة",
        date: "التاريخ",
        details: "تفاصيل التسجيل",
        notes: "ملاحظات",
        markSigned: "وضع كموقَّع",
        markNew: "إرجاع إلى جديد",
        delete: "حذف",
        deleteConfirm: "حذف هذا التسجيل؟ لا يمكن التراجع.",
        allStatuses: "كل الحالات",
        viewPdf: "عرض الاستمارة (PDF)",
        noPdf: "لا توجد استمارة محفوظة",
      },
      status: { new: "جديد", signed: "موقَّع", archived: "مؤرشف" },
      overview: { totalRegs: "إجمالي التسجيلات", thisMonth: "هذا الشهر", teams: "الفرق", players: "اللاعبون", latest: "أحدث التسجيلات", viewAll: "عرض الكل", none: "لا تسجيلات بعد." },
    },
  },
  he: {
    dir: "rtl",
    langName: "עברית",
    nav: { home: "בית", teams: "קבוצות", games: "משחקים", highlights: "שיאים", gallery: "גלריה", historic: "מבט היסטורי", staff: "צוות", volunteers: "מתנדבים", register: "הרשמה", contact: "צור קשר" },
    hero: { badge: "אגודת הכדורסל האורתודוקסית — נצרת", cta: "להרשמה", secondary: "לקבוצות" },
    teams: {
      eyebrow: "הקבוצות שלנו",
      heading: "קבוצות",
      subheading: "הכירו את הקבוצות, השחקנים והמשחקים.",
      empty: "אין קבוצות להצגה כרגע.",
      players: "שחקנים",
      matches: "משחקים",
      noPlayers: "עדיין לא נוספו שחקנים.",
      noMatches: "אין משחקים מתוזמנים עדיין.",
      vs: "נגד",
      at: "ב־",
      viewIbba: "עמוד IBBA",
      teamIbba: "עמוד הקבוצה ב-IBBA",
      open: "פרטים",
      coaches: "מאמנים",
      noCoaches: "עדיין לא נוספו מאמנים.",
      responsible: "איש קשר",
      phone: "טלפון",
    },
    games: {
      eyebrow: "לוח משחקים",
      heading: "משחקים",
      subheading: "כל המשחקים שלנו לפי תאריך — מהקרוב לרחוק.",
      empty: "אין משחקים מתוזמנים עדיין.",
      filterTeam: "לפי קבוצה",
      filterPlayer: "לפי שחקן",
      allTeams: "כל הקבוצות",
      allPlayers: "כל השחקנים",
      upcoming: "הקרובים",
      past: "שהיו",
      vs: "נגד",
      at: "ב־",
      viewIbba: "עמוד IBBA",
      responsible: "איש קשר",
      phone: "טלפון",
    },
    coach: {
      loginTitle: "פורטל המאמנים",
      loginSubtitle: "הזינו את מספר הזהות שלכם כדי לרשום נוכחות.",
      idLabel: "מספר זהות",
      idPlaceholder: "מספר הזהות שלך",
      signIn: "כניסה",
      signingIn: "מתחבר…",
      wrong: "מספר זהות לא מוכר. פנו למנהל.",
      error: "משהו השתבש. נסו שוב.",
      signOut: "יציאה",
      myTeamsTitle: "הקבוצות שלי",
      myTeamsSubtitle: "בחרו קבוצה כדי לרשום נוכחות.",
      noTeams: "עדיין לא שויכו אליכם קבוצות. פנו למנהל.",
      takeAttendance: "רישום נוכחות",
      backToTeams: "← חזרה לקבוצות",
      dateLabel: "תאריך",
      present: "נוכח",
      absent: "נעדר",
      markAllPresent: "סמן הכל נוכח",
      clearAll: "ניקוי הכל",
      submit: "שמירת נוכחות",
      submitting: "שומר…",
      submitted: "הנוכחות נשמרה",
      noPlayers: "אין שחקנים בקבוצה זו.",
      lastTaken: "עודכן לאחרונה",
      loadError: "הטעינה נכשלה. נסו שוב.",
    },
    historic: { eyebrow: "מההיסטוריה שלנו" },
    staff: { eyebrow: "הצוות שלנו", heading: "צוות", subheading: "המאמנים והאנשי מנהלה שמאחורי המועדון.", empty: "עדיין לא נוספו אנשי צוות." },
    volunteers: { eyebrow: "ידיים תורמות", heading: "מתנדבים", subheading: "מי שתורמים מזמנם למען המועדון.", empty: "עדיין לא נוספו מתנדבים." },
    highlights: { eyebrow: "קליפים", heading: "שיאים", subheading: "הרגעים הכי טובים מהמגרש.", empty: "אין סרטונים עדיין." },
    gallery: { eyebrow: "הצצה אלינו", heading: "גלריה", subheading: "רגעים מהמשחקים ומחיי המועדון." },
    register: {
      eyebrow: "הצטרפו אלינו",
      heading: "הרשמה למועדון",
      subheading: "מלאו את הפרטים וחתמו על טופס ההרשמה כאן.",
      firstName: "שם פרטי",
      lastName: "שם משפחה",
      phone: "טלפון",
      email: "אימייל",
      notes: "הערות",
      notesOptional: "הערות (לא חובה)",
      submit: "שליחת הרשמה",
      submitting: "שולח…",
      successTitle: "ההרשמה התקבלה!",
      successBody: "שלחנו אישור לאימייל שלכם, והמועדון יצור איתכם קשר בקרוב.",
      signCta: "פתיחת טופס החתימה",
      signHelp: "חתמו במסגרת שלמטה כדי להשלים את ההרשמה.",
      registerAnother: "הרשמה נוספת",
      perks: ["אימונים קבועים", "משחקים בליגת IBBA", "רוח אורתודוקסית ואחווה"],
      errors: { required: "שדה חובה", phone: "מספר טלפון לא תקין", email: "כתובת אימייל לא תקינה", generic: "אירעה שגיאה. נסו שוב." },
      form: {
        sectionPlayer: "פרטי השחקן/ית", sectionParents: "פרטי ההורים", sectionContact: "כתובת ובית ספר", sectionClub: "מועדון", sectionSign: "הצהרה וחתימה",
        player: "שם השחקן/ית", idNumber: "מספר זהות", birthDate: "תאריך לידה", phonePlayer: "טלפון השחקן/ית",
        father: "שם האב", mother: "שם האם", phoneFather: "טלפון האב", phoneMother: "טלפון האם",
        address: "כתובת", school: "בית ספר", grade: "כיתה",
        jerseySize: "מידת מדים", jerseyPlaceholder: "— בחר מידה —",
        payment: "אופן תשלום", paymentPlaceholder: "— אופן תשלום —", paymentCash: "מזומן", paymentCheck: "צ'קים", paymentCard: "כרטיס אשראי",
        paymentWithin7Days: "יש להסדיר את התשלום תוך 7 ימים ממועד ההרשמה.",
        cardTitle: "פרטי כרטיס", cardName: "השם על הכרטיס", cardNumber: "מספר כרטיס", cardExpiry: "תוקף", cardCvc: "קוד אבטחה",
        payNow: "לתשלום", paySecureNote: "התשלום מתבצע דרך שער תשלום מאובטח; איננו שומרים את פרטי הכרטיס.", payPending: "התשלום יושלם לאחר השליחה.",
        guardian: "שם האפוטרופוס", date: "תאריך",
        signature: "חתימת האפוטרופוס", signatureHint: "חתמו עם האצבע או העכבר במסגרת", clear: "ניקוי",
        consent: "אני מאשר/ת כי אני האפוטרופוס של השחקן/ית, מסכים/ה לתנאי ההרשמה ולפרסום תמונות ילדיי במסגרת פעילויות העמותה, וכי ההרשמה מותנית בבדיקה רפואית ובתשלום.",
        feeNote: "דמי הרשמה שנתיים: 3,500 ₪ (לא כולל 30 ₪ לאיגוד הכדורסל). ההרשמה מותנית בתשלום חובות קודמים.",
        optional: "רשות",
      },
    },
    footer: { contact: "צור קשר", address: "כתובת", directions: "ניווט ב-Waze", follow: "עקבו אחרינו", rights: "כל הזכויות שמורות.", adminLink: "ניהול" },
    admin: {
      loading: "טוען…",
      viewSite: "צפייה באתר",
      signOut: "התנתקות",
      save: "שמירת שינויים",
      saving: "שומר…",
      refresh: "רענון",
      actions: { add: "הוספה", edit: "עריכה", delete: "מחיקה", cancel: "ביטול", search: "חיפוש" },
      nav: { overview: "סקירה", registrations: "הרשמות", teams: "קבוצות", players: "שחקנים", coaches: "מאמנים", attendance: "נוכחות", content: "תוכן", sections: "מקטעים", settings: "הגדרות" },
      players: { add: "הוספת שחקן", none: "אין עדיין שחקנים ברשימה.", search: "חיפוש שחקן…", name: "שם", addNew: "+ יצירת שחקן חדש", pickerPlaceholder: "חיפוש או הוספת שחקן…" },
      coaches: { add: "הוספת מאמן", none: "אין עדיין מאמנים.", search: "חיפוש מאמן…", name: "שם", idNumber: "מספר זהות", phone: "טלפון", addNew: "+ יצירת מאמן חדש", pickerPlaceholder: "חיפוש או הוספת מאמן…" },
      attendance: {
        subtitle: "בחרו קבוצה כדי לראות את נוכחות השחקנים לאורך התאריכים.",
        pickTeam: "בחרו קבוצה",
        backToTeams: "← חזרה לקבוצות",
        noTeams: "אין עדיין קבוצות.",
        present: "נוכח",
        absent: "נעדר",
        notMarked: "—",
        player: "שחקן",
        number: "מספר",
        takenBy: "נרשם ע״י",
        noRecords: "אין עדיין רישומי נוכחות לקבוצה זו.",
        gridHint: "כל עמודה היא תאריך שבו נרשמה נוכחות.",
        calendar: "📅 לוח שנה",
        closeCalendar: "סגירת לוח השנה",
        pickDate: "בחרו תאריך כדי לראות את הנוכחות בו",
        dayNoRecords: "אין נוכחות רשומה ביום זה.",
        dateColumn: "תאריך",
        rate: "שיעור",
      },
      settings: {
        title: "הגדרות",
        subtitle: "שינוי סיסמת הניהול.",
        current: "סיסמה נוכחית",
        newPass: "סיסמה חדשה",
        confirm: "אישור סיסמה",
        save: "עדכון סיסמה",
        saved: "הסיסמה עודכנה",
        mismatch: "הסיסמאות אינן תואמות",
        tooShort: "הסיסמה קצרה מדי (לפחות 4 תווים)",
        wrongCurrent: "הסיסמה הנוכחית שגויה",
      },
      login: {
        title: "כניסת מנהל",
        subtitle: "הזינו את סיסמת המנהל כדי להמשיך.",
        passwordLabel: "סיסמה",
        signIn: "כניסה",
        signingIn: "מתחבר…",
        wrong: "סיסמה שגויה. נסו שוב.",
        error: "משהו השתבש. נסו שוב.",
        demo: "סיסמת הדגמה:",
        showPassword: "הצגת הסיסמה",
        hidePassword: "הסתרת הסיסמה",
      },
      titles: {
        overview: "לוח בקרה",
        overviewSub: "סקירה של ההרשמות והקבוצות.",
        registrations: "הרשמות",
        registrationsSub: "מי נרשם למועדון ומעקב אחר סטטוס החתימה.",
        teams: "קבוצות",
        teamsSub: "צרו קבוצות והוסיפו שחקנים, משחקים וקישורי IBBA.",
        players: "שחקנים",
        playersSub: "הרשימה הכללית של כל השחקנים. הוסיפו, ערכו או מחקו; משמשת בכל הקבוצות.",
        coaches: "מאמנים",
        coachesSub: "הרשימה הכללית של המאמנים. הוסיפו מספר זהות וטלפון; משמשת בכל הקבוצות ולכניסה.",
        attendance: "נוכחות",
        attendanceSub: "מעקב אחר נוכחות השחקנים לפי קבוצה ותאריך.",
        content: "תוכן",
        contentSub: "עריכת טקסט, גופנים ותמונות. התצוגה מתעדכנת תוך כדי; השינויים נשמרים בלחיצה.",
      },
      contentTabs: { hero: "בית", highlights: "שיאים", gallery: "גלריה", historic: "מבט היסטורי", staff: "צוות", volunteers: "מתנדבים", register: "הרשמה", blocks: "בלוקים", footer: "כותרת תחתונה", backgrounds: "רקעים" },
      people: { addStaff: "הוספת איש צוות", addVolunteer: "הוספת מתנדב", emptyStaff: "עדיין לא נוספו אנשי צוות.", emptyVolunteers: "עדיין לא נוספו מתנדבים.", name: "שם", role: "תפקיד", photo: "תמונה" },
      historicEditor: { title: "כותרת", body: "טקסט", image: "תמונה" },
      registerEditor: { eyebrow: "תווית", heading: "כותרת", subheading: "כותרת משנה", feeNote: "הערת תשלום", consent: "טקסט הסכמה", perks: "יתרונות", addPerk: "הוספת יתרון", feeAmount: "סכום התשלום (₪)", feeAmountHint: "הסכום שייגבה בכרטיס" },
      preview: { label: "תצוגה חיה — מתעדכנת בעת שמירה" },
      toasts: { saved: "נשמר — באתר עכשיו", saveError: "השמירה נכשלה" },
      imageUpload: { upload: "העלאת תמונה", replace: "החלפת תמונה", remove: "הסרה", uploading: "מעלה…", failed: "ההעלאה נכשלה" },
      positioner: { label: "מיקום התמונה", hint: "גררו את התמונה כדי למסגר אותה", reset: "איפוס", frameShape: "צורת המסגרת:", align: "יישור:" },
      sections: {
        subtitle: "הצגה/הסתרה של מקטעים ושינוי הסדר. משפיע גם על העמוד וגם על לשוניות הניווט.",
        tip: "טיפ: הסתרת הרשמה או צור קשר מסירה אותם מהאתר — בדרך כלל כדאי להשאיר אותם מוצגים.",
        shown: "מוצג",
        hidden: "מוסתר",
        showHint: "מוסתר — לחצו כדי להציג",
        hideHint: "מוצג — לחצו כדי להסתיר",
        moveUp: "העברה למעלה",
        moveDown: "העברה למטה",
      },
      gallery: { add: "הוספת תמונה", empty: "אין תמונות עדיין. הוסיפו תמונות לקרוסלה.", caption: "כיתוב (לא חובה)" },
      fields: {
        headline: "כותרת ראשית",
        subtitle: "כותרת משנה",
        body: "תוכן",
        phone: "טלפון",
        email: "אימייל",
        address: "כתובת",
        socialLinks: "רשתות חברתיות",
        addLink: "הוספת קישור",
        linkLabel: "שם הקישור",
      },
      team: {
        none: "אין קבוצות עדיין.",
        addTitle: "הוספת קבוצה",
        cover: "תמונת הקבוצה",
        coverHint: "מוצגת על הכרטיס",
        name: "שם הקבוצה",
        description: "תיאור",
        detailBg: "רקע מסך מלא",
        detailBgHint: "מוצג במסך מלא בפתיחת הקבוצה",
        ibbaLink: "קישור IBBA לקבוצה",
        ibbaLinkHint: "קישור לעמוד הקבוצה באתר IBBA",
        show: "הצגת הקבוצה באתר",
        deleteTitle: "מחיקת קבוצה",
        deleteWarn: "למחוק? לא תוצג באתר. השחקנים נשארים ברשימה הכללית.",
        players: "שחקנים",
        playersHint: "הוסיפו שחקן קיים או צרו שחקן חדש מיד",
        selectExisting: "בחרו שחקן קיים…",
        addExisting: "הוספה",
        addNew: "+ שחקן חדש",
        newPlayerName: "שם השחקן החדש",
        number: "מספר",
        position: "תפקיד",
        detach: "הסרה מהקבוצה",
        noPlayers: "עדיין לא נוספו שחקנים.",
        coaches: "מאמנים",
        coachesHint: "הוסיפו מאמן קיים או צרו מאמן חדש מיד",
        noCoaches: "עדיין לא נוספו מאמנים.",
        addNewCoach: "+ מאמן חדש",
        coachId: "מספר זהות",
        coachPhone: "טלפון",
        matches: "משחקים",
        matchesHint: "נגד מי, מתי, איפה, איש קשר, וקישור IBBA",
        addMatch: "+ הוספת משחק",
        opponent: "יריבה",
        opponentLogo: "סמל היריבה",
        matchDate: "תאריך ושעה",
        matchWhere: "מיקום",
        contactName: "איש קשר",
        contactNameHint: "האדם אליו פונים בקבוצה היריבה",
        contactPhone: "טלפון איש הקשר",
        matchIbba: "קישור IBBA למשחק",
        removeMatch: "הסרה",
        noMatches: "אין משחקים עדיין.",
        roster: "רשימת שחקנים כללית",
        rosterHint: "כאן מופיעים כל השחקנים; מחיקת שחקן מסירה אותו מכל הקבוצות.",
      },
      highlight: {
        subtitle: "הוסיפו סרטונים — קובץ שהועלה או קישור YouTube/Instagram.",
        add: "הוספת סרטון",
        none: "אין סרטונים עדיין.",
        video: "קובץ וידאו",
        videoHint: "העלו mp4/webm, או הדביקו קישור וידאו ישיר",
        embed: "קישור YouTube / Instagram",
        embedHint: "הדביקו קישור צפייה והוא יוטמע",
        or: "או",
        poster: "תמונה ממוזערת (לא חובה)",
        caption: "כיתוב",
      },
      reg: {
        none: "אין הרשמות עדיין.",
        name: "שם",
        phone: "טלפון",
        email: "אימייל",
        status: "סטטוס",
        date: "תאריך",
        details: "פרטי ההרשמה",
        notes: "הערות",
        markSigned: "סימון כחתום",
        markNew: "החזרה לחדש",
        delete: "מחיקה",
        deleteConfirm: "למחוק את ההרשמה? לא ניתן לבטל.",
        allStatuses: "כל הסטטוסים",
        viewPdf: "צפייה בטופס (PDF)",
        noPdf: "אין טופס שמור",
      },
      status: { new: "חדש", signed: "חתום", archived: "בארכיון" },
      overview: { totalRegs: "סך ההרשמות", thisMonth: "החודש", teams: "קבוצות", players: "שחקנים", latest: "הרשמות אחרונות", viewAll: "הצגת הכל", none: "אין הרשמות עדיין." },
    },
  },
  en: {
    dir: "ltr",
    langName: "English",
    nav: { home: "Home", teams: "Teams", games: "Games", highlights: "Highlights", gallery: "Gallery", historic: "Historic glance", staff: "Staff", volunteers: "Volunteers", register: "Register", contact: "Contact" },
    hero: { badge: "Orthodox Basketball Association — Nazareth", cta: "Register now", secondary: "See teams" },
    teams: {
      eyebrow: "Our teams",
      heading: "Teams",
      subheading: "Meet our teams, their players and their fixtures.",
      empty: "No teams to show right now.",
      players: "Players",
      matches: "Matches",
      noPlayers: "No players added yet.",
      noMatches: "No matches scheduled yet.",
      vs: "vs",
      at: "at",
      viewIbba: "IBBA page",
      teamIbba: "Team page on IBBA",
      open: "Details",
      coaches: "Coaches",
      noCoaches: "No coaches added yet.",
      responsible: "Contact",
      phone: "Phone",
    },
    games: {
      eyebrow: "Schedule",
      heading: "Games",
      subheading: "Every one of our games, ordered by date — soonest first.",
      empty: "No games scheduled yet.",
      filterTeam: "By team",
      filterPlayer: "By player",
      allTeams: "All teams",
      allPlayers: "All players",
      upcoming: "Upcoming",
      past: "Past",
      vs: "vs",
      at: "at",
      viewIbba: "IBBA page",
      responsible: "Contact",
      phone: "Phone",
    },
    coach: {
      loginTitle: "Coaches portal",
      loginSubtitle: "Enter your ID number to take attendance.",
      idLabel: "ID number",
      idPlaceholder: "Your ID number",
      signIn: "Sign in",
      signingIn: "Signing in…",
      wrong: "Unknown ID number. Contact the admin.",
      error: "Something went wrong. Try again.",
      signOut: "Sign out",
      myTeamsTitle: "My teams",
      myTeamsSubtitle: "Pick a team to take attendance.",
      noTeams: "No teams are linked to you yet. Contact the admin.",
      takeAttendance: "Take attendance",
      backToTeams: "← Back to teams",
      dateLabel: "Date",
      present: "Present",
      absent: "Absent",
      markAllPresent: "Mark all present",
      clearAll: "Clear all",
      submit: "Save attendance",
      submitting: "Saving…",
      submitted: "Attendance saved",
      noPlayers: "No players on this team.",
      lastTaken: "Last updated",
      loadError: "Could not load. Try again.",
    },
    historic: { eyebrow: "From our history" },
    staff: { eyebrow: "Our staff", heading: "Staff", subheading: "The coaches and administrators behind the club.", empty: "No staff added yet." },
    volunteers: { eyebrow: "Helping hands", heading: "Volunteers", subheading: "The people who give their time to the club.", empty: "No volunteers added yet." },
    highlights: { eyebrow: "Clips", heading: "Highlights", subheading: "The best moments from the court.", empty: "No clips yet." },
    gallery: { eyebrow: "A look inside", heading: "Gallery", subheading: "Moments from the games and club life." },
    register: {
      eyebrow: "Join us",
      heading: "Register with the club",
      subheading: "Leave your details and sign the registration form right here.",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone",
      email: "Email",
      notes: "Notes",
      notesOptional: "Notes (optional)",
      submit: "Submit registration",
      submitting: "Submitting…",
      successTitle: "Registration received!",
      successBody: "We emailed you a confirmation and the club will be in touch soon.",
      signCta: "Open the signing form",
      signHelp: "Sign in the box below to complete your registration.",
      registerAnother: "Register someone else",
      perks: ["Regular training", "Games in the IBBA league", "Orthodox spirit & brotherhood"],
      errors: { required: "Required field", phone: "Invalid phone number", email: "Invalid email address", generic: "Something went wrong. Please try again." },
      form: {
        sectionPlayer: "Player details", sectionParents: "Parents", sectionContact: "Address & school", sectionClub: "Club", sectionSign: "Declaration & signature",
        player: "Player name", idNumber: "ID number", birthDate: "Date of birth", phonePlayer: "Player phone",
        father: "Father's name", mother: "Mother's name", phoneFather: "Father's phone", phoneMother: "Mother's phone",
        address: "Address", school: "School", grade: "Grade / class",
        jerseySize: "Jersey size", jerseyPlaceholder: "— Select size —",
        payment: "Payment method", paymentPlaceholder: "— Payment method —", paymentCash: "Cash", paymentCheck: "Cheques", paymentCard: "Credit card",
        paymentWithin7Days: "Please settle the fee within 7 days of registering.",
        cardTitle: "Card details", cardName: "Name on card", cardNumber: "Card number", cardExpiry: "Expiry", cardCvc: "CVC",
        payNow: "Pay now", paySecureNote: "Processed through a secure payment gateway; we never store your card details.", payPending: "Payment will be completed after you submit.",
        guardian: "Guardian name", date: "Date",
        signature: "Guardian signature", signatureHint: "Sign with your finger or mouse in the box", clear: "Clear",
        consent: "I confirm I am the player's guardian, agree to the registration terms and to publishing my child's photos within the club's activities, and that registration is subject to a medical check and payment of fees.",
        feeNote: "Annual registration fee: ₪3,500 (excludes the ₪30 basketball-association fee). Registration is subject to payment of previous years' dues.",
        optional: "optional",
      },
    },
    footer: { contact: "Contact", address: "Address", directions: "Directions on Waze", follow: "Follow us", rights: "All rights reserved.", adminLink: "Admin" },
    admin: {
      loading: "Loading…",
      viewSite: "View site",
      signOut: "Sign out",
      save: "Save changes",
      saving: "Saving…",
      refresh: "Refresh",
      actions: { add: "Add", edit: "Edit", delete: "Delete", cancel: "Cancel", search: "Search" },
      nav: { overview: "Overview", registrations: "Registrations", teams: "Teams", players: "Players", coaches: "Coaches", attendance: "Attendance", content: "Content", sections: "Sections", settings: "Settings" },
      players: { add: "Add player", none: "No players in the roster yet.", search: "Search players…", name: "Name", addNew: "+ Create new player", pickerPlaceholder: "Search or add a player…" },
      coaches: { add: "Add coach", none: "No coaches yet.", search: "Search coaches…", name: "Name", idNumber: "ID number", phone: "Phone", addNew: "+ Create new coach", pickerPlaceholder: "Search or add a coach…" },
      attendance: {
        subtitle: "Pick a team to see its players' attendance across dates.",
        pickTeam: "Pick a team",
        backToTeams: "← Back to teams",
        noTeams: "No teams yet.",
        present: "Present",
        absent: "Absent",
        notMarked: "—",
        player: "Player",
        number: "Number",
        takenBy: "Taken by",
        noRecords: "No attendance records for this team yet.",
        gridHint: "Each column is a date attendance was taken.",
        calendar: "📅 Calendar",
        closeCalendar: "Close calendar",
        pickDate: "Pick a date to see its attendance",
        dayNoRecords: "No attendance recorded on this day.",
        dateColumn: "Date",
        rate: "Rate",
      },
      settings: {
        title: "Settings",
        subtitle: "Change the admin password.",
        current: "Current password",
        newPass: "New password",
        confirm: "Confirm password",
        save: "Update password",
        saved: "Password updated",
        mismatch: "Passwords don't match",
        tooShort: "Password too short (at least 4 characters)",
        wrongCurrent: "Current password is incorrect",
      },
      login: {
        title: "Admin sign in",
        subtitle: "Enter the admin password to continue.",
        passwordLabel: "Password",
        signIn: "Sign in",
        signingIn: "Signing in…",
        wrong: "Incorrect password. Try again.",
        error: "Something went wrong. Try again.",
        demo: "Demo password:",
        showPassword: "Show password",
        hidePassword: "Hide password",
      },
      titles: {
        overview: "Dashboard",
        overviewSub: "Overview of registrations and teams.",
        registrations: "Registrations",
        registrationsSub: "See who registered with the club and track signing status.",
        teams: "Teams",
        teamsSub: "Create teams and add players, matches and IBBA links.",
        players: "Players",
        playersSub: "The shared roster of all players. Add, edit or delete; used across every team.",
        coaches: "Coaches",
        coachesSub: "The shared roster of coaches. Add ID number and phone; used across teams and for sign-in.",
        attendance: "Attendance",
        attendanceSub: "Track player attendance by team and date.",
        content: "Content",
        contentSub: "Edit text, fonts and images. The preview updates as you type; changes go live on save.",
      },
      contentTabs: { hero: "Home", highlights: "Highlights", gallery: "Gallery", historic: "Historic", staff: "Staff", volunteers: "Volunteers", register: "Register", blocks: "Blocks", footer: "Footer", backgrounds: "Backgrounds" },
      people: { addStaff: "Add staff member", addVolunteer: "Add volunteer", emptyStaff: "No staff added yet.", emptyVolunteers: "No volunteers added yet.", name: "Name", role: "Role", photo: "Photo" },
      historicEditor: { title: "Title", body: "Body", image: "Image" },
      registerEditor: { eyebrow: "Eyebrow", heading: "Heading", subheading: "Subheading", feeNote: "Fee note", consent: "Consent text", perks: "Perks", addPerk: "Add perk", feeAmount: "Fee amount (₪)", feeAmountHint: "the total charged by card" },
      preview: { label: "Live preview — updates when you Save" },
      toasts: { saved: "Saved — live on the site", saveError: "Could not save" },
      imageUpload: { upload: "Upload image", replace: "Replace image", remove: "Remove", uploading: "Uploading…", failed: "Upload failed" },
      positioner: { label: "Reposition photo", hint: "drag the image to frame it", reset: "Reset", frameShape: "Frame shape:", align: "Align:" },
      sections: {
        subtitle: "Show/hide sections and reorder them. This controls both the page and the nav tabs.",
        tip: "Tip: hiding Register or Contact removes them from the site — usually keep those on.",
        shown: "Shown",
        hidden: "Hidden",
        showHint: "Hidden — tap to show",
        hideHint: "Shown — tap to hide",
        moveUp: "Move up",
        moveDown: "Move down",
      },
      gallery: { add: "Add image", empty: "No images yet. Add images to the carousel.", caption: "Caption (optional)" },
      fields: {
        headline: "Headline",
        subtitle: "Subtitle",
        body: "Body",
        phone: "Phone",
        email: "Email",
        address: "Address",
        socialLinks: "Social links",
        addLink: "Add link",
        linkLabel: "Link label",
      },
      team: {
        none: "No teams yet.",
        addTitle: "Add team",
        cover: "Team photo",
        coverHint: "shown on the card",
        name: "Team name",
        description: "Description",
        detailBg: "Detail background",
        detailBgHint: "shown full-screen when the team is opened",
        ibbaLink: "Team IBBA link",
        ibbaLinkHint: "link to the team's page on the IBBA website",
        show: "Show this team on the site",
        deleteTitle: "Delete team",
        deleteWarn: "Delete it? It won't show on the site. Players stay in the shared roster.",
        players: "Players",
        playersHint: "Attach an existing player or create a new one instantly",
        selectExisting: "Select an existing player…",
        addExisting: "Add",
        addNew: "+ New player",
        newPlayerName: "New player name",
        number: "Number",
        position: "Position",
        detach: "Remove from team",
        noPlayers: "No players added yet.",
        coaches: "Coaches",
        coachesHint: "Attach an existing coach or create a new one instantly",
        noCoaches: "No coaches added yet.",
        addNewCoach: "+ New coach",
        coachId: "ID number",
        coachPhone: "Phone",
        matches: "Matches",
        matchesHint: "who, when, where, contact, and an IBBA link",
        addMatch: "+ Add match",
        opponent: "Opponent",
        opponentLogo: "Opponent logo",
        matchDate: "Date & time",
        matchWhere: "Where",
        contactName: "Contact person",
        contactNameHint: "the person to go to at the opponent club",
        contactPhone: "Contact phone",
        matchIbba: "Match IBBA link",
        removeMatch: "Remove",
        noMatches: "No matches yet.",
        roster: "Shared player roster",
        rosterHint: "Every player appears here; deleting a player removes them from all teams.",
      },
      highlight: {
        subtitle: "Add video clips — an uploaded file or a YouTube/Instagram link.",
        add: "Add clip",
        none: "No clips yet.",
        video: "Video file",
        videoHint: "upload mp4/webm, or paste a direct video link",
        embed: "YouTube / Instagram link",
        embedHint: "paste a watch link and it will be embedded",
        or: "or",
        poster: "Poster image (optional)",
        caption: "Caption",
      },
      reg: {
        none: "No registrations yet.",
        name: "Name",
        phone: "Phone",
        email: "Email",
        status: "Status",
        date: "Date",
        details: "Registration details",
        notes: "Notes",
        markSigned: "Mark as signed",
        markNew: "Mark as new",
        delete: "Delete",
        deleteConfirm: "Delete this registration? This cannot be undone.",
        allStatuses: "All statuses",
        viewPdf: "View form (PDF)",
        noPdf: "No saved form",
      },
      status: { new: "New", signed: "Signed", archived: "Archived" },
      overview: { totalRegs: "Total registrations", thisMonth: "This month", teams: "Teams", players: "Players", latest: "Latest registrations", viewAll: "View all", none: "No registrations yet." },
    },
  },
};

export const LOCALES: Locale[] = ["ar", "he", "en"];
export const DEFAULT_LOCALE: Locale = "ar";

/** Every editable string in the dictionary, as dot-paths (e.g. "nav.home",
 * "register.perks.0"), grouped by their top-level section in dictionary order.
 * Skips structural keys (dir/langName). Powers the admin "Texts" editor. */
export function editableTextKeys(): { group: string; keys: string[] }[] {
  const skipTop = new Set(["dir", "langName"]);
  const groups: { group: string; keys: string[] }[] = [];
  const ref = dictionaries.ar as unknown as Record<string, unknown>;
  const walk = (obj: Record<string, unknown>, prefix: string, bucket: string[]) => {
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") bucket.push(p);
      else if (Array.isArray(v)) v.forEach((item, i) => typeof item === "string" && bucket.push(`${p}.${i}`));
      else if (v && typeof v === "object") walk(v as Record<string, unknown>, p, bucket);
    }
  };
  for (const [top, v] of Object.entries(ref)) {
    if (skipTop.has(top) || typeof v !== "object" || v === null) continue;
    const bucket: string[] = [];
    walk(v as Record<string, unknown>, top, bucket);
    if (bucket.length) groups.push({ group: top, keys: bucket });
  }
  return groups;
}

/** Read a dictionary dot-path (e.g. "highlights.heading") across all three
 * languages and return it as a {@link Localized} value. Used as the built-in
 * default for inline-editable UI strings, so callers never hand-write fallbacks. */
export function dictText(path: string): Localized {
  const walk = (obj: unknown) =>
    path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
  const at = (l: Locale) => {
    const v = walk(dictionaries[l]);
    return typeof v === "string" ? v : "";
  };
  return { ar: at("ar"), he: at("he"), en: at("en") };
}
