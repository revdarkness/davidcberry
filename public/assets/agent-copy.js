/* Copy buttons for the code blocks on /agent/.
   Kept as a real file under /assets/ rather than an Astro <script> because
   Astro inlines a script this small, and public/_headers sets
   script-src 'self' with no 'unsafe-inline' -- an inline module is blocked
   silently in production while working perfectly in `astro dev`. */
document.querySelectorAll('.codeblock .copy-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var code = btn.closest('.codeblock').querySelector('code');
    if (!code) return;
    var flash = function (label) {
      btn.textContent = label;
      btn.classList.toggle('is-copied', label === 'Copied');
      setTimeout(function () {
        btn.textContent = 'Copy';
        btn.classList.remove('is-copied');
      }, 1600);
    };
    // Clipboard access can be refused outright (permissions, insecure context).
    // Say so rather than showing a success state that did not happen; the text
    // is selectable either way.
    if (!navigator.clipboard) return flash('Select it');
    navigator.clipboard.writeText(code.innerText).then(
      function () { flash('Copied'); },
      function () { flash('Select it'); }
    );
  });
});
