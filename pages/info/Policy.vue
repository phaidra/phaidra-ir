<template>
  <div class="ma-6">
    <template v-if="$i18n.locale === 'deu'">
      <h3 class="title font-weight-light primary--text mb-4">Leitlinien des Publikationsservices u:scholar</h3>

      <h3 class="subtitle font-weight-light primary--text mb-2">1 Beschreibung des Dienstes</h3>
      <p>Das unter <a href="http://uscholar.univie.ac.at" target="_blank">http://uscholar.univie.ac.at</a> erreichbare <dfn>Publikationsservice u:scholar</dfn> bietet allen Angehörigen der Universität Wien die organisatorischen und technischen Rahmenbedingungen zur elektronischen Publikation und Archivierung wissenschaftlicher Dokumente und Materialien. Es dient als institutionelles Repositorium und steht in engem Zusammenhang mit der Forschungsdokumentation der Universität. Im Rahmen dieses Angebots werden die Dokumente und Materialien im Internet unter Einhaltung von Qualitätsstandards für die Öffentlichkeit bereitgestellt. Damit ist u:scholar ein wichtiger Baustein der Open-Access-Aktivitäten zur Umsetzung der „Berliner Erklärung über den offenen Zugang zu wissenschaftlichem Wissen“, die am 26.01.2010 vom damaligen Rektor der Universität Wien unterzeichnet wurde.</p>
      <p>u:scholar basiert technisch auf <dfn>Phaidra</dfn>, dem <dfn>Digital Asset Management System</dfn> der Universität Wien, dessen Betrieb und Weiterentwicklung in internationale Initiativen und Projekte zu Open Access eingebunden ist.</p>
      <p>Die in u:scholar aufgenommenen elektronischen Objekte erhalten dauerhafte Adressen und werden über nationale und internationale Nachweisinstrumente wie z.B. Bibliothekskataloge oder Suchmaschinen erschlossen. Eine internationalen Standards entsprechende Langzeitarchivierung der Daten über die Mindestspeicherzeit von fünf Jahren hinaus hat für die Universität Wien höchste Priorität.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">2 Zweck des Dienstes</h3>
      <p>Die Universität Wien hat sich zum Ziel gesetzt, die elektronischen wissenschaftlichen Dokumente und Materialien ihrer Angehörigen zu speichern, formal und inhaltlich (Schlagwörter, Abstracts und Klassifizierung mittels DDC) zu erfassen, zu archivieren und der Öffentlichkeit zugänglich zu machen. Dies bezieht sich sowohl auf rein elektronische Publikationen („born digital“) als auch auf elektronische Versionen gedruckter Dokumente.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">3 Rechte der Autorinnen und Autoren</h3>
      <p>Die Urheberrechte der Autorinnen und Autoren bleiben gewahrt. Von Seiten der Universität Wien steht der Veröffentlichung in u:scholar einer weiteren Veröffentlichung der Dokumente in Fachzeitschriften oder Monographien sowie auf anderen Servern nichts entgegen. Allen Wissenschaftlerinnen und Wissenschaftlern der Universität Wien wird empfohlen, sich beim Abschluss von Verlagsverträgen ein entsprechendes Nutzungsrecht zu sichern und die von ihnen verfassten Dokumente zusätzlich in u:scholar zu veröffentlichen. Autorinnen und Autoren wird die Verwendung von <dfn><a target="_blank" href="http://creativecommons.org/licenses/?lang=de">Creative-Commons-Lizenzen</a></dfn> nahe gelegt. Die Einhaltung von Urheber- und Verwertungsrechten Dritter liegt in der Verantwortung der Autorinnen und Autoren bzw. der Herausgeberinnen und Herausgeber der elektronischen Dokumente.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">4 Technische Besonderheiten</h3>
      <p>Die digitalen Objekte werden mit individuellen und dauerhaften Adressen (=Persistent Identifier) versehen, welche einen unmittelbaren Zugriff auf die Dokumente und Materialien erlauben, sofern nicht rechtliche Beschränkungen bestehen.</p>
      <p>Für die Erschließung, Speicherung und Archivierung der elektronischen Dokumente werden internationale Standards wie die Richtlinien der <dfn><a target="_blank" href="http://www.openarchives.org/">Open Archives Initiative</a></dfn> genutzt. Als Metadaten-Format wird u.a. <dfn>Dublin Core</dfn> verwendet.</p>
      <p>Für die Objekte in u:scholar wird eine Verfügbarkeit von mindestens fünf Jahren garantiert.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">5 Merkmale der Objekte in u:scholar</h3>
      <p>Elektronische Dokumente und Materialien, die in u:scholar veröffentlicht und archiviert werden, haben folgende Merkmale:

      <ol type="a" style="margin-left:70px">
      <li>Sie sind grundsätzlich zur Verbreitung in der Öffentlichkeit bestimmt. Bei Bedarf kann der Zugriff eingeschränkt oder mit Sperrfristen (z.B. aufgrund von Embargobestimmungen) versehen werden.</li>
      <li>Nachhaltigkeit und daher auch Zitierbarkeit der Inhalte wird dadurch ge währleistet, dass Veränderungen an den Objekten immer als neue Versionen gespeichert werden müssen. Die Vorgängerversion bleibt mit ihrem Persistent Identifier erhalten.</li>
      <li>Grundsätzlich sind alle Dateiformate erlaubt. Wir empfehlen für eine Verbesserung der Bedingungen für die Langzeitarchivierung jedoch den Upload sowohl eines PDFs als auch des Quellformats, um eine langfristige Lesbarkeit der Inhalte gewährleisten zu können.</li>
      <li>Inhaltlich handelt es sich um wissenschaftliche Dokumente und Materialien der Universität Wien: Zeitschriftenartikel, Pre- und Postprints, Monographien, Sammelwerke, Kongressmaterialien, Forschungsberichte, Working Papers u.ä.</li>
      </ol>
      </p>

      <p>Sollten die eingereichten Dokumente nicht diese Merkmale aufweisen, behält sich das Repository Management der Universitätsbibliothek (s. Abs. 6) vor, sie nicht zu veröffentlichen und sich mit der oder dem Einreichenden in Verbindung zu setzen.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">6 Organisatorische Regelungen</h3>
      <p>u:scholar wird von der Universität Wien betrieben, vom Zentralen Informatikdienst (ZID) technisch und von dem Repository Management an der Universitätsbibliothek inhaltlich betreut. Die geltenden Nutzungsbedingungen können unter <nuxt-link :to="'/info/terms'">Nutzungsbedingungen</nuxt-link> abgerufen werden.</p>
      <p>Die elektronische Veröffentlichung und Archivierung ist für die Autorinnen und Autoren kostenfrei.</p>
      <p>Die Dokumente und Materialien können auf mehreren Wegen nach u:scholar gelangen: Einerseits durch einen direkten Upload seitens der Autorinnen und Autoren über das Portal u:scholar, andererseits im Rahmen standardisierter Workflows durch das Repository Management der Universitätsbibliothek oder über das Forschungsdokumentationssystem der Universität. In allen Fällen werden die Metadaten und die Dateien einer funktionalen und technischen Kontrolle durch das Repository Management unterzogen, das auch zusätzlich anfallende Arbeiten wie z.B. die Aufbereitung der elektronischen Dokumente oder die Konvertierung in andere Formate übernimmt.</p>
      <p>Eine Ansprechpartnerin oder einen Ansprechpartner für alle u:scholar betreffenden Fragen erreichen sie unter <a href="mailto:support.uscholar@univie.ac.at">support.uscholar@univie.ac.at</a>.</p>
    </template>
    <template v-else>
      <h3 class="title font-weight-light primary--text mb-4">Policy for the publication service u:scholar</h3>

      <h3 class="subtitle font-weight-light primary--text mb-2">1 Description of the service</h3>
      <p>The publication service u:scholar, which can be found online at <a href="http://uscholar.univie.ac.at" target="_blank">http://uscholar.univie.ac.at</a>, offers the organisational and technical infrastructure to enable all members of Vienna University to publish and archive academic documents and materials electronically. It serves as an institutional repository and is closely connected to the university's research activities documentation. Thus u:scholar is an important part of the open access activities to implement the Berlin declaration on open access to academic knowledge, which was signed on 26 January 2010 by the then rector of Vienna University.</p>
      <p>Technically, u:scholar is based on Phaidra, Vienna University's digital asset management system, whose operation and development is integrated into international open access projects and initiatives.</p>
      <p>Objects entered into u:scholar receive permanent links and are catalogued through national and international retrieval systems such as library catalogues or search engines. One of Vienna University's top priorities is to ensure long-term archiving according to international standards, beyond the minimum period of five years.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">2 Purpose of the service</h3>
      <p>It is the aim of Vienna University to store, catalogue (by means of keywords, abstracts and the DDC) and archive the electronic documents and materials of its members, and to offer the public free access to them. This applies to purely electronic (“born digital”) publications as well as to electronic versions of print documents.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">3 Authors’ rights</h3>
      <p>All authors’ rights are preserved. Vienna University does not disallow authors from publishing documents they have uploaded to u:scholar in academic journals, monographs or on other servers. All academic staff of Vienna University are advised to secure the respective rights in their contracts with their publishers and to also publish their documents through u:scholar. It is recommended that authors use <a target="_blank" href="http://creativecommons.org/licenses/?lang=en">Creative Commons licences</a>. It is the authors’ or editors’ own responsibility to ensure that the rights of third parties are not infringed or violated through the publication on u:scholar.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">4 Technical features</h3>
      <p>All digital objects are given individual and permanent addresses (persistent identifiers), which allow direct access to the documents and materials, given that no legal restrictions apply.</p>
      <p>International standards such as the guidelines of the <a target="_blank" href=" http://www.openarchives.org/">Open Archives Initiative</a> are used to catalogue, store and archive the electronic documents. Dublin Core is, among others, used as the metadata format.</p>
      <p>Access to objects in u:scholar is guaranteed for a minimum of five years.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">5 Properties of objects in u:scholar</h3>
      <p>Electronic documents published and archived n u:scholar share the following properties:

      <ol type="a" style="margin-left:70px">
      <li>They are meant to be distributed to the public. If desired, access can be restricted or allowed only after a given period of time (e.g. if embargo conditions apply)</li>
      <li>Changes to objects must always be stored as new versions; the previous version retains its persistent identifier. This ensures the sustained usability and correct citation of the contents.</li>
      <li>In principle, all file formats are allowed. However, it is recommended that users upload a PDF version in addition to the source format to ensure long-term readability of the contents.</li>
      <li>Content-wise, the objects should be academic documents and materials from Vienna University: journal articles, pre- and post-prints, monographs, edited volumes, congress proceedings, research reports, working papers, etc.</li>
      </ol>
      </p>

      <p>If the uploaded documents do not fulfil these qualities, the University Library’s Repository Management (see chapter 6) reserves the right to deny publication and contact the submitter.</p>

      <h3 class="subtitle font-weight-light primary--text mb-2">6 Organisation</h3>
      <p>u:scholar is run by Vienna University, with the Vienna University Computer Center (ZID) in charge of technical services and the University Library’s Repository Management in charge of the content. The current conditions of use can be found at <nuxt-link :to="'/info/terms'">Terms of use</nuxt-link>.</p>
      <p>Electronic publication and archiving is offered to the authors free of charge.</p>
      <p>The documents and materials can be submitted to u:scholar in a variety of ways: firstly, authors can upload them directly by using the u:scholar portal. Secondly, objects in u:scholar will be created within the framework of standardized workflows by the University Library’s Repository Management or via the university’s research activities database. In all of these cases, the Repository Management will check the metadata and the files for functional and technical integrity, and conduct other necessary work such as process the electronic documents or convert them to alternative file formats.</p>
      <p>You can contact our staff for all your questions pertaining to u:scholar at <a href="mailto:support.uscholar@univie.ac.at">support.uscholar@univie.ac.at</a>.</p>
    </template>
  </div>
</template>

<script>
export default {
}
</script>
