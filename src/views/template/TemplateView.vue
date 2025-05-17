<template>
  <div class="container-fluid">
    <div class="navbar">
      <header class="navbar_header">
        <slot name="navbar"></slot>
      </header>
    </div>
    <div class="wrapper">
      <slot name="sidebar"></slot>
      <main class="content">
        <section>
            <slot></slot>
        </section>
      </main>
      <div class="bottombar">
        <footer class="text_footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
  </div>
</template>
<style scoped>
</style>
