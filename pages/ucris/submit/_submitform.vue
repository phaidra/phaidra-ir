<template>
  <admin-submit-ir :submitformType="$route.params.submitform" ref="form"></admin-submit-ir>
</template>

<script>

export default {
  name: 'admin-submit',
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      vm.$store.commit('setLoading', true)
      vm.$refs.form.resetSubmission().then(() => {
        vm.$store.commit('setLoading', false)
        next()
      })
    })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.$store.commit('setLoading', true)
    this.$refs.form.resetSubmission().then(() => {
      this.$store.commit('setLoading', false)
      next()
    })
  }
}
</script>


