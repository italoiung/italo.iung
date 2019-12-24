{
    // Vanilla LazyLoad instance
    // https://github.com/verlok/lazyload
    const lazyLoadInstance = new LazyLoad({
        elements_selector: ".lazy"
    })

    // window.addEventListener('load', event => {
    //     const video = document.querySelector('#videoBackground')
    //     // Force autoplay for browser compatibility
    //     console.log(video)
    //     video.play()
    // })

    // Smooth scroll for nav links
    const navLinks = document.querySelectorAll('nav > a')
    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault()
            let element = document.getElementById(link.href.split('#')[1])
            console.log(element)
            window.scrollTo({
                top: element.offsetTop - element.scrollTop + element.clientTop,
                behavior: 'smooth'
            })
        })
    });

    // Fix section head when scrolled over and undo it when left
    window.addEventListener('scroll', event => {
        elements = document.querySelectorAll('.secondary-section__item--head')
        elements.forEach(element => {
            let rect = element.getBoundingClientRect()
            let parent = element.parentElement
            let parentRect = parent.getBoundingClientRect()
            let image = parent.querySelector('.logo-aside')
            if (parentRect.top <= 0) {
                if (image) {
                    image.style.position = 'fixed'
                    image.style.top = '20px'
                }
                element.style.position = 'fixed'
                element.style.top = 0
                element.style.bottom = 'initial'
            }
            if (parentRect.top > 0) {
                if (image) {
                    image.style.position = 'absolute'
                    image.style.top = '20px'
                }
                element.style.position = 'absolute'
                element.style.top = 0
                element.style.bottom = 'initial'
            }
            if (parentRect.top < ((parentRect.height - rect.height) * -1)) {
                if (image) {
                    image.style.position = 'absolute'
                    image.style.top = parentRect.height - rect.height + 20 + 'px'
                }
                element.style.position = 'absolute'
                element.style.top = 'initial'
                element.style.bottom = 0
            }
        })

        // Principles animation when scrolled over
        const principios = document.querySelector('.principios')
        const principiosLogo = principios.querySelector('.logo').getBoundingClientRect()
        if (window.innerHeight > (principiosLogo.top + principiosLogo.height)) {
            principios.classList.add('scrolled')
        }
        if (window.innerHeight < (principiosLogo.top + principiosLogo.height)) {
            principios.classList.remove('scrolled')
        }
    })
    // Handling form submission
    const form = document.getElementById('contact-form')
    form.addEventListener('submit', event => {
        event.preventDefault()
        event.target.classList.add('sending')
        event.target.classList.remove('sent')
        event.target.classList.remove('error')

        const formData = new FormData(event.target)
        const object = {}
        formData.forEach((value, key) => { object[key] = value })

        fetch('https://italo.iung.me/sendmail.php', {
            method: 'POST',
            body: JSON.stringify(object),
            headers: { "Content-Type": "application/json" },
        })
            .then(response => {
                return response.text()
            })
            .then(data => {
                event.target.classList.remove('sending')
                if (data) {
                    event.target.classList.add('sent')
                    event.target.reset()
                } else {
                    event.target.classList.add('error')
                }
            })
            .catch(e => console.log(e))
    })
}