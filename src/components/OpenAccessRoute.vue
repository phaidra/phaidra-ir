<template>
  <v-card outlined>
    <v-card-text>
      <template v-for="(f, i) in fields">
        <v-row v-for="(v, j) in f.value" :key="'fv'+i+j">
          <v-col cols="12" md="3" :class="j !== 0 ? 'pt-0 pb-2' : 'py-2'"><template v-if="j === 0">{{ f.label }}</template></v-col>
          <v-col v-if="(typeof v === 'object') && (v !== null)" cols="12" md="9" :class="j !== 0 ? 'pt-0 pb-2' : 'py-2'"><a :href="v.url" target="_blank">{{ v.name }}</a></v-col>
          <v-col v-else cols="12" md="9" :class="j !== 0 ? 'pt-0 pb-2' : 'py-2'">{{ v }}</v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'open-access-route',
  props: {
    route: Object
  },
  computed: {
    fields: function () {
      let fields = []
      if (this.route.hasOwnProperty('prerequisites')) {
        if (this.route.prerequisites.hasOwnProperty('prerequisites_phrases')) {
          if (Array.isArray(this.route.prerequisites.prerequisites_phrases)) {
            let values = []
            for (let l of this.route.prerequisites.prerequisites_phrases) {
              if (l.language === 'en') {
                values.push(this.$t(l.phrase))
              }
            }
            fields.push(
              {
                label: this.$t('Prerequisites'),
                value: values
              }
            )
          }
        }
        if (this.route.prerequisites.hasOwnProperty('prerequisite_funders')) {
          if (Array.isArray(this.route.prerequisites.prerequisite_funders)) {
            let values = []
            for (let funder of this.route.prerequisites.prerequisite_funders) {
              let url = ''
              let name = ''
              if (Array.isArray(funder.funder_metadata.url)) {
                url = funder.funder_metadata.url[0].url
              }
              if (Array.isArray(funder.funder_metadata.name)) {
                name = funder.funder_metadata.name[0].name
              }
              values.push(
                {
                  url,
                  name
                }
              )
            }
            fields.push(
              {
                label: this.$t('Prerequisite Funders'),
                value: values
              }
            )
          }
        }
        if (this.route.prerequisites.hasOwnProperty('prerequisite_subjects')) {
          if (Array.isArray(this.route.prerequisites.prerequisite_subjects)) {
            fields.push(
              {
                label: this.$t('Prerequisite Subjects'),
                value: this.route.prerequisites.prerequisite_subjects.join(', ')
              }
            )
          }
        }
      }
      if (this.route.hasOwnProperty('location')) {
        if (Array.isArray(this.route.location.location_phrases)) {
          let values = []
          for (let l of this.route.location.location_phrases) {
            let val = ''
            if (l.language === 'en') {
              val = this.$t(l.phrase)
            }
            if (l.value === 'named_repository') {
              if (Array.isArray(this.route.location.named_repository)) {
                val += ' (' + this.route.location.named_repository.join(', ') + ')'
              } else {
                val += ' (' + this.route.location.named_repository + ')'
              }
            }
            if (l.value === 'named_academic_social_network') {
              if (Array.isArray(this.route.location.named_academic_social_network)) {
                val += ' (' + this.route.location.named_academic_social_network.join(', ') + ')'
              } else {
                val += ' (' + this.route.location.named_academic_social_network + ')'
              }
            }
            values.push(val)
          }
          fields.push(
            {
              label: this.$t('Location'),
              value: values
            }
          )
        }
      }
      if (this.route.hasOwnProperty('embargo')) {
        let unit = this.route.embargo.units
        if (Array.isArray(this.route.embargo.units_phrases)) {
          for (let l of this.route.embargo.units_phrases) {
            if (l.language === 'en') {
              unit = this.$t(l.phrase)
            }
          }
        }
        fields.push(
          {
            label: this.$t('Embargo'),
            value: [ this.route.embargo.amount + ' ' + unit ]
          }
        )
      } else {
        fields.push(
          {
            label: this.$t('Embargo'),
            value: [ this.$t('No Embargo') ]
          }
        )
      }
      console.log(this.route.copyright_owner_phrases)
      if (this.route.hasOwnProperty('copyright_owner_phrases')) {
        if (Array.isArray(this.route.copyright_owner_phrases)) {
          let values = []
          for (let l of this.route.copyright_owner_phrases) {
            if (l.language === 'en') {
              values.push(this.$t(l.phrase))
            }
          }
          fields.push(
            {
              label: this.$t('Copyright Owner'),
              value: values
            }
          )
        }
      }
      if (this.route.hasOwnProperty('license')) {
        if (Array.isArray(this.route.license)) {
          for (let lic of this.route.license) {
            if (Array.isArray(lic.license_phrases)) {
              let values = []
              for (let l of lic.license_phrases) {
                if (l.language === 'en') {
                  values.push(this.$t(l.phrase))
                }
              }
              fields.push(
                {
                  label: this.$t('License'),
                  value: values
                }
              )
            }
          }
        }
      }
      if (this.route.hasOwnProperty('additional_oa_fee')) {
        if (this.route.additional_oa_fee === 'yes') {
          fields.push(
            {
              label: this.$t('Additional OA Fee'),
              value: [ this.$t('Yes') ]
            }
          )
        }
      }
      if (this.route.hasOwnProperty('conditions')) {
        if (Array.isArray(this.route.conditions)) {
          let values = []
          for (let con of this.route.conditions) {
            values.push(con)
          }
          fields.push(
            {
              label: this.$t('Conditions'),
              value: values
            }
          )
        }
      }
      if (this.route.hasOwnProperty('publisher_deposit')) {
        if (Array.isArray(this.route.publisher_deposit)) {
          let values = []
          for (let pubd of this.route.publisher_deposit) {
            let url = ''
            let name = ''
            if (pubd.hasOwnProperty('repository_metadata')) {
              if (pubd.repository_metadata.hasOwnProperty('url')) {
                url = pubd.repository_metadata.url
              }
              if (pubd.repository_metadata.hasOwnProperty('name')) {
                if (Array.isArray(pubd.repository_metadata.name)) {
                  name = pubd.repository_metadata.name[0].name
                }
              }
              values.push(
                {
                  url,
                  name
                }
              )
            }
          }
          console.log(values)
          fields.push(
            {
              label: this.$t('Publisher Will Deposit in'),
              value: values
            }
          )
        }
      }
      if (this.route.hasOwnProperty('public_notes')) {
        if (Array.isArray(this.route.public_notes)) {
          let values = []
          for (let con of this.route.public_notes) {
            values.push(con)
          }
          fields.push(
            {
              label: this.$t('Notes'),
              value: values
            }
          )
        } else {
          fields.push(
            {
              label: this.$t('Notes'),
              value: this.route.public_notes
            }
          )
        }
      }
      return fields
    }
  }
}
</script>
