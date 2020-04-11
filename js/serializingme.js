$(function() {
  $('a:not([href^="'+location.origin+'"],[href^="/"],[href^="mailto:"],[href^="bitcoin:"],[href^="monero:"],[class*="footer-link"])').each(function() {
    $(this).append('<span>&nbsp;<i class="fas fa-external-link-alt"></i></span>');
  });
  $('a[href^="mailto:"]').each(function() {
    this.href = this.href.replace(/arroba/g, '@').replace(/ponto/g, '.');
  });
});
