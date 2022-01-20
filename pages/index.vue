<template>
  <v-container>
    <v-row class="mx-4">
      <v-col cols="12" v-if="$i18n.locale === 'deu'" >
        <h3 class="title font-weight-light primary--text mb-4">u:scholar - Forschung zugänglich machen</h3>
        <p>u:scholar ist das <strong>Institutional Repository der Universität Wien</strong>, in dem Universitätsangehörige ihre Zeitschriftenartikel, Working Papers, Monographien, Konferenzbeiträge und andere wissenschaftliche Materialien hochladen und für andere frei zugänglich machen können. Die Publikationsplattform ist für <strong>Zweit- und Erstveröffentlichungen geeignet</strong>. Dokumente, die in u:scholar hochgeladen werden, befinden sich aus technischer Sicht in <a target="_blank" href="https://datamanagement.univie.ac.at/">Phaidra</a>, wo sie auch archiviert werden. Sie wollen u:scholar ausprobieren? Dann laden wir Sie ein, das System innerhalb des Campus mit <a target="_blank" href="https://uscholar-sandbox.univie.ac.at/">u:scholar-sandbox</a> zu testen.</p>
        <p>Mit u:scholar können Sie leicht die OA-Anforderungen von Forschungsförderern wie dem FWF erfüllen. Weitere Informationen finden Sie auf der <a target="_blank" href="https://openaccess.univie.ac.at/publikationsdienste/uscholar/">Open-Access-Website</a> der Universität Wien. Gerne unterstützen wir Sie bei Unklarheiten, ob ein Upload rechtlich erlaubt ist oder nicht. Siehe dazu auch <a target="_blank" href="https://openaccess.univie.ac.at/publikationsdienste/uscholar/rechtsfragen/">Rechtsfragen zum Open-Access-Publizieren</a>.</p>
      </v-col>
      <v-col cols="12" v-else >
        <h3 class="title font-weight-light primary--text mb-4">u:scholar - Make research accessible</h3>
        <p>u:scholar is the <strong>University of Vienna's institutional repository</strong> where University affiliates can upload their journal articles, working papers, monographs, conference papers and other scholarly materials and make them openly available to others. The platform supports both <strong>secondary and primary publication</strong>. Documents uploaded to u:scholar are technically being stored in <a target="_blank" href="https://datamanagement.univie.ac.at/en/">Phaidra</a> where they are also being archived. If you want to try out u:scholar, you are welcome to test it using the <a target="_blank" href="https://uscholar-sandbox.univie.ac.at/">u:scholar sandbox</a> on Campus.</p>
        <p>u:scholar allows easy compliance with OA requirements of funders such as the FWF. You can find additional information on the <a target="_blank" href="https://openaccess.univie.ac.at/en/publication-services/uscholar/">Open Access website</a> of the University of Vienna. We will gladly assist you with questions concerning the legality of uploads. See also <a target="_blank" href="https://openaccess.univie.ac.at/en/publication-services/uscholar/legal-issues/">legal issues concerning Open Access publication</a>.</p>
      </v-col>
    </v-row>
    <v-row class="mx-4">
      <v-col cols="12" md="6" offset-md="3">
        <v-row>
        <v-text-field
          v-model="q"
          :placeholder="$t('Search...')"
          autocomplete="off"
          append-icon="mdi-magnify"
          v-on:keyup.enter="$router.push({ name: 'search', query: { q } })"
          clearable
          solo
          hide-details
        >
        </v-text-field>
        <v-btn raised color="primary" class="ml-4 mt-1" large @click="$router.push({ name: 'search', query: { q } })">Search/Browse</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  data () {
    return {
      q: ''
    }
  }
}
</script>
