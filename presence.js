const presence = new Presence({
  clientId: "APPLICATION_ID")
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

const ActivityAssets = {
  Logo: "https://i.imgur.com/mbTaZ6U.png",
  Admin: "https://i.imgur.com/mbTaZ6U.png",
  Patrol: "https://i.imgur.com/mbTaZ6U.png",
  Edit: "https://i.imgur.com/mbTaZ6U.png"
};

presence.on("UpdateData", async () => {
  const presenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageText: "Vikidia (FR)" 
  };

  const { pathname = "", hostname = "", href = "", search = "" } = document.location;
  const urlParams = new URLSearchParams(search);

  let language = "FR";
  const langMatch = hostname.match(/([a-z]{2,3})\.vikidia\.org/);
  if (langMatch && langMatch[1]) {
    language = langMatch[1].toUpperCase();
  }
  presenceData.smallImageText = `Vikidia (${language})`;

  const cleanTitle = (title = "") => {
    if (!title) return "Inconnu";
    return decodeURIComponent(title.replace(/_/g, " "));
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/wiki/")) {
      return cleanTitle(pathname.replace("/wiki/", ""));
    }
    const titleParam = urlParams.get("title");
    return titleParam ? cleanTitle(titleParam) : "Accueil";
  };

  const getTargetUser = () => {
    const wpTarget = urlParams.get("wpTarget");
    if (wpTarget) return cleanTitle(wpTarget);
    const user = urlParams.get("user");
    if (user) return cleanTitle(user);

    const pathParts = pathname.split("/");
    if (pathParts.length > 3) {
      return cleanTitle(pathParts[pathParts.length - 1]);
    }
    return "Inconnu";
  };

  const action = urlParams.get("action") || "";
  const veaction = urlParams.get("veaction") || "";
  const logType = urlParams.get("type") || "";

  if (action === "delete") {
    presenceData.details = "🗑️ Supprime une page";
    presenceData.state = getPageTitle();
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (action === "undelete" || pathname.includes("Special:Undelete") || pathname.includes("Spécial:Restaurer")) {
    presenceData.details = "♻️ Restaure une page";
    presenceData.state = getPageTitle();
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (action === "protect" || action === "unprotect") {
    presenceData.details = action === "protect" ? "🛡️ Protège une page" : "🔓 Déprotège une page";
    presenceData.state = getPageTitle();
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Block") || pathname.includes("Spécial:Bloquer")) {
    presenceData.details = "🚫 Bloque un utilisateur";
    presenceData.state = getTargetUser();
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Unblock") || pathname.includes("Spécial:Débloquer")) {
    presenceData.details = "✅ Débloque un utilisateur";
    presenceData.state = getTargetUser();
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:BlockList") || pathname.includes("Spécial:Utilisateurs_bloqués")) {
    presenceData.details = "📋 Liste des blocages";
    presenceData.state = "Consultation";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:UserRights") || pathname.includes("Spécial:Droits")) {
    presenceData.details = "⚙️ Gestion des droits";
    presenceData.state = getTargetUser();
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (action === "revisiondelete" || action === "deleterevision") {
    presenceData.details = "🔒 Masquage de révisions";
    presenceData.state = getPageTitle();
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:MergeHistory") || pathname.includes("Spécial:Fusionner")) {
    presenceData.details = "🔀 Fusion d'historiques";
    presenceData.state = getPageTitle();
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Import") || pathname.includes("Spécial:Importer")) {
    presenceData.details = "📥 Import de pages";
    presenceData.state = "Importation";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Export") || pathname.includes("Spécial:Exporter")) {
    presenceData.details = "📤 Export de pages";
    presenceData.state = "Exportation";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Nuke")) {
    const target = getTargetUser();
    presenceData.details = "💣 Suppression massive";
    presenceData.state = target !== "Inconnu" ? `Pages de ${target}` : "Sélection";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:AbuseFilter")) {
    presenceData.details = "🛡️ Filtres anti-abus";
    const filterId = pathname.split("/").pop() || "";
    presenceData.state = filterId && !filterId.includes("AbuseFilter") ? `Filtre #${filterId}` : "Liste des filtres";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:AbuseLog")) {
    presenceData.details = "📊 Journal des abus";
    presenceData.state = "Analyse des déclenchements";
    presenceData.smallImageKey = ActivityAssets.Patrol;
  }
  else if (action === "rollback") {
    const user = urlParams.get("from") || "Inconnu";
    presenceData.details = "🔄 Rollback";
    presenceData.state = `${getPageTitle()} (${cleanTitle(user)})`;
    presenceData.smallImageKey = ActivityAssets.Patrol;
  }
  else if (action === "markpatrolled") {
    presenceData.details = "✔️ Marque comme patrouillée";
    presenceData.state = getPageTitle();
    presenceData.smallImageKey = ActivityAssets.Patrol;
  }
  else if (pathname.includes("Special:RecentChanges") || pathname.includes("Spécial:Modifications_récentes")) {
    presenceData.details = "👁️ Patrouille";
    presenceData.state = urlParams.get("hidepatrolled") === "1" ? "Non patrouillées" : "Toutes modifications";
    presenceData.smallImageKey = ActivityAssets.Patrol;
  }
  else if (pathname.includes("Special:Log") || pathname.includes("Spécial:Journal")) {
    presenceData.details = "📜 Journaux";
    presenceData.smallImageKey = ActivityAssets.Admin;
    if (logType === "delete" || pathname.includes("/delete")) { presenceData.details = "📜 Journal suppression"; presenceData.state = "Suppressions/restaurations"; }
    else if (logType === "protect" || pathname.includes("/protect")) { presenceData.details = "📜 Journal protection"; presenceData.state = "Protections"; }
    else if (logType === "block" || pathname.includes("/block")) { presenceData.details = "📜 Journal blocage"; presenceData.state = "Blocages"; }
    else if (logType === "rights" || pathname.includes("/rights")) { presenceData.details = "📜 Journal droits"; presenceData.state = "Modifications droits"; }
    else if (logType === "move" || pathname.includes("/move")) { presenceData.details = "📜 Journal déplacement"; presenceData.state = "Renommages"; }
    else if (logType === "import" || pathname.includes("/import")) { presenceData.details = "📜 Journal import"; presenceData.state = "Importations"; }
    else if (logType === "patrol" || pathname.includes("/patrol")) { presenceData.details = "📜 Journal patrouille"; presenceData.state = "Pages patrouillées"; }
    else if (logType === "abusefilter" || pathname.includes("/abusefilter")) { presenceData.details = "📜 Journal filtres"; presenceData.state = "Filtres anti-abus"; }
    else {
      const user = urlParams.get("user");
      const page = urlParams.get("page");
      if (user) presenceData.state = `Utilisateur: ${cleanTitle(user)}`;
      else if (page) presenceData.state = `Page: ${cleanTitle(page)}`;
      else presenceData.state = "Vue d'ensemble";
    }
  }
  else if (action === "edit" || veaction === "edit") {
    const section = urlParams.get("section");
    presenceData.details = "✏️ Édite un article";
    presenceData.state = section ? `${getPageTitle()} (§${section})` : getPageTitle();
    presenceData.smallImageKey = ActivityAssets.Edit;
  }
  else if (pathname.includes("Special:Contributions") || pathname.includes("Spécial:Contributions")) {
    const target = getTargetUser();
    presenceData.details = "📝 Contributions";
    presenceData.state = target !== "Inconnu" ? `de ${target}` : "Sélection";
  }
  else if (pathname.includes("Special:DeletedContributions") || pathname.includes("Spécial:Contributions_supprimées")) {
    const target = getTargetUser();
    presenceData.details = "🗑️ Contribs supprimées";
    presenceData.state = target !== "Inconnu" ? `de ${target}` : "Archives";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (action === "move" || pathname.includes("Special:MovePage") || pathname.includes("Spécial:Déplacer")) {
    presenceData.details = "➡️ Déplace une page";
    presenceData.state = getPageTitle();
  }
  else if (action === "history") {
    presenceData.details = "📜 Historique";
    presenceData.state = getPageTitle();
  }
  else if (action === "diff" || pathname.includes("Special:Diff")) {
    presenceData.details = "🔍 Comparaison";
    presenceData.state = getPageTitle();
  }
  else if (pathname.includes("Special:Search") || pathname.includes("Spécial:Recherche")) {
    presenceData.details = "🔎 Recherche";
    presenceData.state = `"${cleanTitle(urlParams.get("search") || "Recherche")}"`;
  }
  else if (pathname.includes("Special:") || pathname.includes("Spécial:")) {
    const specialPage = pathname.split("/")[2] || "";
    if (specialPage.includes("Categories") || specialPage.includes("Catégories")) presenceData.details = "📚 Liste catégories";
    else if (specialPage.includes("Lonelypages") || specialPage.includes("Pages_orphelines")) { presenceData.details = "🔗 Pages orphelines"; presenceData.smallImageKey = ActivityAssets.Patrol; }
    else if (specialPage.includes("Uncategorized") || specialPage.includes("Sans_catégorie")) { presenceData.details = "📋 Pages non catégorisées"; presenceData.smallImageKey = ActivityAssets.Patrol; }
    else if (specialPage.includes("BrokenRedirects") || specialPage.includes("Redirections_cassées")) { presenceData.details = "🔗 Redirections cassées"; presenceData.smallImageKey = ActivityAssets.Patrol; }
    else if (specialPage.includes("Listusers") || specialPage.includes("Utilisateurs")) presenceData.details = "👥 Liste utilisateurs";
    else if (specialPage.includes("Statistics") || specialPage.includes("Statistiques")) { presenceData.details = "📈 Statistiques"; presenceData.state = `Vikidia (${language})`; }
    else { presenceData.details = "⚙️ Page spéciale"; presenceData.state = cleanTitle(specialPage); }
  }
  else if (pathname.startsWith("/wiki/")) {
    const articleTitle = cleanTitle(pathname.replace("/wiki/", ""));
    if (articleTitle.startsWith("Catégorie:") || articleTitle.startsWith("Category:")) { presenceData.details = "📁 Catégorie"; presenceData.state = articleTitle.split(":")[1] || "Inconnu"; }
    else if (articleTitle.startsWith("Portail:") || articleTitle.startsWith("Portal:")) { presenceData.details = "🌐 Portail"; presenceData.state = articleTitle.split(":")[1] || "Inconnu"; }
    else if (articleTitle.startsWith("Vikidia:")) { presenceData.details = "📖 Page Vikidia"; presenceData.state = articleTitle.split(":")[1] || "Inconnu"; }
    else if (articleTitle.startsWith("Utilisateur:") || articleTitle.startsWith("User:")) { presenceData.details = "👤 Page utilisateur"; presenceData.state = articleTitle.split(":")[1]?.split("/")[0] || "Inconnu"; }
    else if (articleTitle.startsWith("Discussion:") || articleTitle.startsWith("Talk:")) { presenceData.details = "💬 Discussion"; presenceData.state = articleTitle.split(":")[1] || "Inconnu"; }
    else if (articleTitle.startsWith("Modèle:") || articleTitle.startsWith("Template:")) { presenceData.details = "📄 Modèle"; presenceData.state = articleTitle.split(":")[1] || "Inconnu"; }
    else {
      presenceData.details = "📖 Lit un article";
      presenceData.state = articleTitle;
      presenceData.buttons = [{ label: "Lire l'article", url: href }];
    }
  }
  else if (pathname === "/" || pathname === "/wiki/Vikidia:Accueil") {
    presenceData.details = "🏠 Page d'accueil";
    presenceData.state = `Vikidia (${language})`;
  }
  else {
    presenceData.details = "🌍 Navigation";
    presenceData.state = `Vikidia (${language})`;
  }

  if (presenceData.details) {
    presence.setActivity(presenceData);
  } else {
    presence.clearActivity();
  }
});