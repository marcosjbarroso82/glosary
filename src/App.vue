<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import termsData from './data/terms.json'

const route = useRoute()
const router = useRouter()
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const selectedLetter = ref('A')
const terms = termsData.terms

// Watch for route changes
watch(() => route.params.termName, (newTermName) => {
  if (newTermName) {
    const term = terms.find(t => t.name.toLowerCase() === newTermName.toLowerCase())
    if (term) {
      selectedLetter.value = term.displayName[0]
    }
  }
}, { immediate: true })

const selectLetter = (letter) => {
  selectedLetter.value = letter
  if (route.params.termName) {
    router.push('/')
  }
}

const filteredTerms = computed(() => {
  return terms.filter(term => 
    term.displayName.toUpperCase().startsWith(selectedLetter.value)
  )
})

const formatDefinition = (definition) => {
  // Replace [[Term|Display Text]] or [[Term]] with clickable links
  return definition.replace(/\[\[([A-Za-z]+)(?:\|([^\]]+))?\]\]/g, (match, termName, displayText) => {
    const termObj = terms.find(t => t.name.toLowerCase() === termName.toLowerCase())
    if (termObj) {
      const linkText = displayText || termObj.displayName
      return `<a href="/term/${termObj.name}" @click.prevent="router.push('/term/${termObj.name}')">${linkText}</a>`
    }
    return match
  })
}

onMounted(() => {
  if (route.params.termName) {
    const term = terms.find(t => t.name.toLowerCase() === route.params.termName.toLowerCase())
    if (term) {
      selectedLetter.value = term.displayName[0]
    }
  }
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Glossary</h1>
      <div class="alphabet-nav">
        <button 
          v-for="letter in alphabet" 
          :key="letter"
          @click="selectLetter(letter)"
          :class="{ active: selectedLetter === letter }"
          class="letter-btn"
        >
          {{ letter }}
        </button>
      </div>
    </header>
    <main class="main-content">
      <div v-if="filteredTerms.length === 0" class="no-terms">
        No terms found for letter "{{ selectedLetter }}"
      </div>
      <div v-else class="terms-list">
        <div v-for="term in filteredTerms" :key="term.name" class="term-card">
          <h2>{{ term.displayName }}</h2>
          <p v-html="formatDefinition(term.definition)"></p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  position: sticky;
  top: 0;
  background: white;
  padding: 1rem 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}

.alphabet-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.letter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.letter-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.main-content {
  padding: 1rem 0;
}

.terms-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.term-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.term-card h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.term-card p {
  margin: 0;
  line-height: 1.5;
  color: #666;
}

.no-terms {
  text-align: center;
  padding: 2rem;
  color: #666;
}

a {
  color: #4CAF50;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .alphabet-nav {
    padding: 0.5rem 0;
  }
  
  .letter-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
