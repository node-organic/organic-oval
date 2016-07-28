<navigation>
  <script>
    require('./navigation-item')
    tag.links = {
      home: {
        href: '#home',
        title: 'Home'
      },
      about: {
        href: '#about',
        title: 'About'
      }
    }
  </script>
  <ul class="navigation">
    <navigation-item ref-link={tag.links.home} />
    <navigation-item ref-link={tag.links.about} />
  </ul>
</navigation>
