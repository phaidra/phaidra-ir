<template>
  <div class="ma-6">
    <template v-if="$i18n.locale === 'deu'">
      <h3 class="title font-weight-light primary--text mb-4">Credits</h3>

      <p>Für das <strong>banner</strong> der Webseite haben wir einen Ausschnitt aus dem Werk <a target="_blank" href="https://www.flickr.com/photos/generated/84253301/in/set-72157594149046982">"substrate print"</a> von Jared Tarbell verwendet. Es handelt sich um ein algorithmisch erzeugtes Gebilde, das dann auf sehr feinem Papier ausgedruckt, fotografiert und im Internet frei zugänglich gemacht wurde. Diese Vorgänge erinnern an einen uns ideal erscheinenden Prozess der wissenschaftlichen Kommunikation, wie er durch u:scholar unterstützt werden soll: von der geistigen Erzeugung der Idee zu ihrer Verwirklichung durch die Entwicklung eines Programms über die Veredlung mittels manueller Eingriffe bis hin zum digitalen Bestimmungsort des Werks, wo es der Öffentlichkeit zur Diskussion gestellt wird. Das Bild steht unter der Lizenz <a target="_blank" href="http://creativecommons.org/licenses/by/2.0/deed.de">CC BY 2.0 US</a>.</p>

      <p><strong>Folgende frei verfügbare Software wurde bei der Entwicklung von u:scholar verwendet:</strong></p>

      <p>
        <ul>
          <li><a target="_blank" href="https://vuejs.org">Vue</a></li>
          <li><a target="_blank" href="https://vuetifyjs.com">Vuetify</a></li>
        </ul>
      </p>

      <p>Die Universität Wien dankt allen beteiligten EntwicklerInnen!</p>
    </template>
    <template v-else>
      <h3 class="title font-weight-light primary--text mb-4">Credits</h3>

      <p>For our <strong>banner</strong> we have used a detail from <a target="_blank" href="https://www.flickr.com/photos/generated/84253301/in/set-72157594149046982">"substrate print"</a> by Jared Tarbell. This art work is an algorithmically produced image, which first has been printed out on paper, then photographed and finally made accessible via the internet. These procedures remind us of an ideal process of scholarly communication, as it is intended to be supported by u:scholar: from the intellectual creation of an idea, its realization through the design of a program and its enrichment by manual engagement to the final digital representation of the work, where it can be discussed by the public. The image is licensed under <a target="_blank" href="http://creativecommons.org/licenses/by/2.0/deed.en">CC BY 2.0 US</a>.</p>

      <p><strong>For the development of u:scholar, following free software packages have been used:</strong></p>

      <p>
        <ul>
          <li><a target="_blank" href="https://vuejs.org">Vue</a></li>
          <li><a target="_blank" href="https://vuetifyjs.com">Vuetify</a></li>
        </ul>
      </p>

      <p>The University of Vienna expresses its thanks to all developers involved!</p>
    </template>
  </div>
</template>

<script>
export default {
}
</script>
