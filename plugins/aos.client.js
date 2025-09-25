import AOS from 'aos'
import 'aos/dist/aos.css'

export default defineNuxtPlugin(() => {
  if (process.client) {
    AOS.init({
      duration: 800,
      easing: 'ease-out-quart',
      once: false, // Allow animations to trigger multiple times
      offset: 100,
      mirror: false, // Don't animate elements when scrolling past them
      anchorPlacement: 'top-bottom' // Trigger when top of element hits bottom of viewport
    })
  }
})