<template>

  <p-i-form
    :form="editform"
    :targetpid="pid"
    :templating="false"
    :validate="validate"
    v-on:object-saved="objectSaved($event)"
  ></p-i-form>

</template>

<script>
import jsonLd from 'phaidra-vue-components/src/utils/json-ld'
import fields from 'phaidra-vue-components/src/utils/fields'
import { context } from '../mixins/context'
import { config } from '../mixins/config'

export default {
  name: 'metadata-editor',
  mixins: [ context, config ],
  data () {
    return {
      editform: {},
      parentpid: ''
    }
  },
  computed: {
    pid: function () {
      return this.$route.params.pid
    }
  },
  methods: {
    validate: function () {
      return true
    },
    objectSaved: function (event) {
      this.$store.commit('setAlerts', [{ type: 'success', msg: 'Metadata for object ' + event + ' saved' }])
      this.$router.push({ name: 'detail', params: { pid: event } })
      this.$vuetify.goTo(0)
    },
    loadJsonld: async function (self, pid) {
      try {
        let response = await this.$http.request({
          method: 'GET',
          url: self.config.api + '/object/' + pid + '/metadata',
          params: {
            mode: 'resolved'
          }
        })
        self.editform = self.json2form(response.data.metadata['JSON-LD'])
        for (let f of self.editform.sections[0].fields) {
          if (f.predicate === 'edm:rights') {
            f.vocabulary = 'alllicenses'
          }
        }
        self.editform.sections[0].fields.push(fields.getField('rights'))
      } catch (error) {
        console.log(error)
        self.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      }
    },
    json2form: function (jsonld) {
      return jsonLd.json2form(jsonld)
    }
  },
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      vm.parentpid = from.params.pid
      vm.loadJsonld(vm, to.params.pid).then(() => {
        next()
      })
    })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.parentpid = from.params.pid
    this.loadJsonld(this, to.params.pid).then(() => {
      next()
    })
  }
}
</script>
