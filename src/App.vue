<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import termsData from './data/terms.json'

const route = useRoute()
const router = useRouter()
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const selectedLetter = ref('A')
const selectedTerm = ref(null)
const terms = termsData.terms
const isFullscreen = ref(false)

// Add computed property for available letters
const availableLetters = computed(() => {
  const letters = new Set()
  terms.forEach(term => {
    term.names.forEach(name => {
      letters.add(name[0].toUpperCase())
    })
  })
  return alphabet.filter(letter => letters.has(letter))
})

// Watch for route changes
watch(() => route.params.termName, (newTermName) => {
  if (newTermName) {
    const term = terms.find(t => t.names.some(name => name.toLowerCase() === newTermName.toLowerCase()))
    if (term) {
      selectedLetter.value = term.names[0][0].toUpperCase()
      selectedTerm.value = term
    } else {
      // If term not found, redirect to home
      router.push('/')
    }
  } else {
    selectedTerm.value = null
  }
}, { immediate: true })

const selectLetter = (letter) => {
  selectedLetter.value = letter
  selectedTerm.value = null
}

const filteredTerms = computed(() => {
  return terms.filter(term => 
    term.names.some(name => name.toUpperCase().startsWith(selectedLetter.value))
  )
})

const formatDefinition = (definition) => {
  // Replace [[Term|Display Text]] or [[Term]] with clickable links
  return definition.replace(/\[\[([A-Za-z0-9\-_.]+)(?:\|([^\]]+))?\]\]/g, (match, termName, displayText) => {
    const termObj = terms.find(t => t.names.some(name => name.toLowerCase() === termName.toLowerCase()))
    if (termObj) {
      const linkText = displayText || termObj.displayName
      return `<a href="/glosary/term/${termObj.names[0]}" @click.prevent="router.push('/term/${termObj.names[0]}')" class="term-link">${linkText}</a>`
    }
    return match
  })
}

// Add fullscreen toggle function
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`)
    })
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

onMounted(() => {
  if (route.params.termName) {
    const term = terms.find(t => t.names.some(name => name.toLowerCase() === route.params.termName.toLowerCase()))
    if (term) {
      selectedLetter.value = term.names[0][0].toUpperCase()
      selectedTerm.value = term
    }
  }

  // Add fullscreen change event listener
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <button 
          class="fullscreen-btn" 
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
        >
          {{ isFullscreen ? '⤓' : '⤢' }}
        </button>
      </div>
      <div class="alphabet-nav">
        <button 
          v-for="letter in availableLetters" 
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
      <div v-if="selectedTerm">
        <!-- Term Detail View -->
        <div class="term-detail">
          <button class="back-btn" @click="router.push('/')">← Back to List</button>
          <div class="term-card">
            <h2>{{ selectedTerm.displayName }}</h2>
            <p v-html="formatDefinition(selectedTerm.definition)"></p>
          </div>
        </div>
      </div>
      <div v-else>
        <!-- Terms List View -->
        <div v-if="filteredTerms.length === 0" class="no-terms">
          No terms found for letter "{{ selectedLetter }}"
        </div>
        <div v-else class="terms-list">
          <div 
            v-for="term in filteredTerms" 
            :key="term.names[0]" 
            class="term-item"
            @click="router.push('/term/' + term.names[0])"
          >
            {{ term.displayName }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 100%;
  margin: 0 auto;
  padding: 0.5rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  background: #ffffff;
  padding: 0.5rem 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  color: #2c3e50;
}

.alphabet-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
  padding: 0.25rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.letter-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: #2c3e50;
}

.letter-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.main-content {
  padding: 0.5rem 0;
}

.terms-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.term-item {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s;
  color: #2c3e50;
  font-weight: 500;
}

.term-item:hover {
  background: #f5f5f5;
  transform: translateX(4px);
}

.term-detail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.back-btn {
  align-self: flex-start;
  background: none;
  border: none;
  color: #4CAF50;
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.back-btn:hover {
  text-decoration: underline;
}

.term-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.term-card h2 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.term-card p {
  margin: 0;
  line-height: 1.5;
  color: #4a4a4a;
  font-size: 0.9375rem;
}

.no-terms {
  text-align: center;
  padding: 1.5rem;
  color: #666;
  font-size: 0.9375rem;
}

.term-link {
  color: #4CAF50;
  text-decoration: none;
  cursor: pointer;
}

.term-link:hover {
  text-decoration: underline;
}

.fullscreen-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: #2c3e50;
  transition: color 0.2s;
  z-index: 101;
}

.fullscreen-btn:hover {
  color: #4CAF50;
}

@media (max-width: 600px) {
  .app {
    padding: 0.25rem;
  }

  .header {
    padding: 0.25rem 0;
  }

  .header-content {
    padding: 0 0.5rem;
  }

  .alphabet-nav {
    padding: 0.25rem 0;
  }
  
  .letter-btn {
    padding: 0.2rem 0.4rem;
    font-size: 0.8125rem;
  }

  .term-item {
    padding: 0.625rem 0.875rem;
  }

  .fullscreen-btn {
    right: 0.5rem;
    font-size: 1.25rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>
