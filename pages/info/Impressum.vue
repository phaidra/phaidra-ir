<template>
  <div class="ma-6">
    <template v-if="$i18n.locale === 'deu'">
      <h3 class="title font-weight-light primary--text mb-4">Impressum</h3>
      <p><strong>Medieninhaberin:</strong><br/>
      Universität Wien, Universitätsring 1, A-1010 Wien; Tel. +43-1-4277-0</p>

      <p><strong>Inhaltliche Verantwortung:</strong><br/>
      Universität Wien, Bibliotheks- und Archivwesen, Universitätsring 1, A-1010 Wien; Leiterin: Maria Seissl, Kontakt-E-Mail: <a href="mailto:direktion.ub@univie.ac.at">direktion.ub@univie.ac.at</a></p>
      <p>Der <strong>Unternehmensgegenstand</strong> ergibt sich aus den Aufgaben der Universität Wien gemäß § 3 Universitätsgesetz 2002, siehe <a href="http://www.univie.ac.at/impressum/" target="_blank">http://www.univie.ac.at/impressum/</a>.</p>

      <p><strong>Aufsichtsbehörde</strong> der Universität Wien:<br/>
      <a target="_blank" href="https://bmbwf.gv.at/">Bundesministerium für Bildung, Wissenschaft und Forschung (BMBWF)</a>.</p>
    </template>
    <template v-else>
      <h3 class="title font-weight-light primary--text mb-4">Impressum</h3>

      <p><strong>Media owner:</strong><br/>
      Vienna University, Universitätsring 1, A-1010 Vienna; Tel. +43-1-4277-0</p>

      <p><strong>Responsible for the content:</strong><br/>
      Vienna University, Library and Archive Services, Universitätsring 1, A-1010 Vienna; Head: Maria Seissl, Contact e-mail: <a href="mailto:direktion.ub@univie.ac.at">direktion.ub@univie.ac.at</a></p>

      <p>The <strong>nature and purpose</strong> is due to the duties of Vienna University pursuant to § 3 Universitätsgesetz 2002, see <a href="http://www.univie.ac.at/en/imprint/" target="_blank">http://www.univie.ac.at/en/imprint/</a>.</p>

      <p><strong>Controlling authority</strong> of Vienna University:<br/>
      <a target="_blank" href="https://bmbwf.gv.at/">Bundesministerium für Bildung, Wissenschaft und Forschung (BMBWF)</a>.</p>
    </template>
  </div>
</template>

<script>
export default {}
</script>
