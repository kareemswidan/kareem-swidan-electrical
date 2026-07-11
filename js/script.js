"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const activeNav = document.querySelector(`[data-nav="${page}"]`);
  if (activeNav) activeNav.setAttribute("aria-current", "page");
  if (page === "products") {
    document.querySelectorAll(".dropdown-toggle").forEach((button) => button.classList.add("is-current"));
  }

  const header = document.querySelector(".site-header");
  const backToTop = document.querySelector(".back-to-top");
  const updateScrollUI = () => {
    const scrolled = window.scrollY > 24;
    if (header) header.classList.toggle("is-scrolled", scrolled);
    if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 520);
  };
  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  if (backToTop) backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const closeMobileNav = () => {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      primaryNav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    });
    primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMobileNav));
  }

  const dropdownButton = document.querySelector(".dropdown-toggle");
  const megaMenu = document.querySelector(".mega-menu");
  const closeDropdown = () => {
    if (!dropdownButton || !megaMenu) return;
    dropdownButton.setAttribute("aria-expanded", "false");
    megaMenu.classList.remove("is-open");
  };
  if (dropdownButton && megaMenu) {
    dropdownButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = dropdownButton.getAttribute("aria-expanded") !== "true";
      dropdownButton.setAttribute("aria-expanded", String(open));
      megaMenu.classList.toggle("is-open", open);
    });
    megaMenu.addEventListener("click", (event) => event.stopPropagation());
    document.addEventListener("click", closeDropdown);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeDropdown();
    closeMobileNav();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMobileNav();
  });

  const revealNodes = [...document.querySelectorAll("[data-reveal]")];
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px" });
    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;
      const open = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });

  initCarousel(reducedMotion);
  initHomeTabs();
  initCatalog();
  initProductDetails();
  initContactForm();
  initGallery(reducedMotion);
});

function initCarousel(reducedMotion) {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll(".hero-slide")];
  const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
  const previous = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      const active = position === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((dot, position) => {
      const active = position === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", String(active));
    });
  };
  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };
  const start = () => {
    if (reducedMotion || slides.length < 2) return;
    stop();
    timer = window.setInterval(() => show(index + 1), 6500);
  };

  if (previous) previous.addEventListener("click", () => { show(index - 1); start(); });
  if (next) next.addEventListener("click", () => { show(index + 1); start(); });
  dots.forEach((dot) => dot.addEventListener("click", () => { show(Number(dot.dataset.carouselDot)); start(); }));
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  start();
}

function initHomeTabs() {
  const tabs = [...document.querySelectorAll("[data-home-tabs] [data-tab]")];
  const products = [...document.querySelectorAll("[data-home-products] [data-category]")];
  if (!tabs.length || !products.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selected = tab.dataset.tab;
      tabs.forEach((button) => button.setAttribute("aria-selected", String(button === tab)));
      products.forEach((card) => card.classList.toggle("is-filtered-out", selected !== "all" && card.dataset.category !== selected));
    });
  });
}

function initCatalog() {
  const cards = [...document.querySelectorAll("[data-product-card]")];
  if (!cards.length) return;
  const params = new URLSearchParams(window.location.search);
  const categoryButtons = [...document.querySelectorAll("[data-category-filters] [data-category]")];
  const currentSelect = document.querySelector('[data-filter="current"]');
  const voltageSelect = document.querySelector('[data-filter="voltage"]');
  const countNode = document.querySelector("[data-product-count]");
  const summaryNode = document.querySelector("[data-search-summary]");
  const emptyState = document.querySelector("[data-empty-state]");
  const filterPanel = document.getElementById("catalog-filters");
  const mobileToggle = document.querySelector(".mobile-filter-toggle");
  let category = params.get("category") || "all";
  const searchTerm = (params.get("q") || "").trim().toLowerCase();

  if (!categoryButtons.some((button) => button.dataset.category === category)) category = "all";
  categoryButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.category === category));

  const update = () => {
    const current = currentSelect ? currentSelect.value : "all";
    const voltage = voltageSelect ? voltageSelect.value : "all";
    let visible = 0;
    cards.forEach((card) => {
      const matchCategory = category === "all" || card.dataset.category === category;
      const matchCurrent = current === "all" || card.dataset.current === current;
      const matchVoltage = voltage === "all" || card.dataset.voltage === voltage;
      const matchSearch = !searchTerm || (card.dataset.search || "").includes(searchTerm);
      const show = matchCategory && matchCurrent && matchVoltage && matchSearch;
      card.classList.toggle("is-filtered-out", !show);
      if (show) visible += 1;
    });
    if (countNode) countNode.textContent = String(visible);
    if (summaryNode) summaryNode.textContent = searchTerm ? `Results for “${searchTerm}”` : category === "all" ? "Showing the complete product range" : `Filtered by ${category}`;
    if (emptyState) emptyState.classList.toggle("is-visible", visible === 0);
  };

  categoryButtons.forEach((button) => button.addEventListener("click", () => {
    category = button.dataset.category || "all";
    categoryButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    update();
  }));
  [currentSelect, voltageSelect].filter(Boolean).forEach((select) => select.addEventListener("change", update));
  document.querySelectorAll("[data-reset-filters]").forEach((button) => button.addEventListener("click", () => {
    category = "all";
    categoryButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.category === "all"));
    if (currentSelect) currentSelect.value = "all";
    if (voltageSelect) voltageSelect.value = "all";
    window.history.replaceState({}, "", window.location.pathname);
    cards.forEach((card) => card.classList.remove("is-filtered-out"));
    if (countNode) countNode.textContent = String(cards.length);
    if (summaryNode) summaryNode.textContent = "Showing the complete product range";
    if (emptyState) emptyState.classList.remove("is-visible");
  }));
  if (mobileToggle && filterPanel) mobileToggle.addEventListener("click", () => {
    const open = mobileToggle.getAttribute("aria-expanded") !== "true";
    mobileToggle.setAttribute("aria-expanded", String(open));
    filterPanel.classList.toggle("is-open", open);
  });
  update();
}

function initProductDetails() {
  const skuNodes = document.querySelectorAll("[data-sku-text]");
  if (!skuNodes.length) return;
  const products = {
    SM1P0250: { category: "Motor protection circuit breaker", description: "Compact magnetic and thermal motor protection circuit breaker with dependable breaking capacity for industrial applications.", range: "1.6–2.5 A", voltage: "400 V AC", capacity: "100 kA", protection: "Magnetic + thermal" },
    SM1P2500: { category: "Motor protection circuit breaker", description: "Adjustable motor protection circuit breaker designed for reliable three-phase machinery protection.", range: "17–25 A", voltage: "400 V AC", capacity: "50 kA", protection: "Magnetic + thermal" },
    BF09: { category: "Industrial contactor", description: "Compact contactor for dependable motor, lighting and general industrial switching applications.", range: "9 A", voltage: "230 V AC coil", capacity: "4 kW at 400 V", protection: "IEC utilisation AC-3" },
    BF26: { category: "Industrial contactor", description: "Efficient, compact contactor suited to frequent switching in control panels and machinery.", range: "26 A", voltage: "230 V AC coil", capacity: "11 kW at 400 V", protection: "IEC utilisation AC-3" },
    RF38: { category: "Thermal overload relay", description: "Reliable motor overload and phase-failure protection with manual or automatic reset.", range: "23–32 A", voltage: "Multi-voltage", capacity: "Class 10A", protection: "Thermal overload" },
    LPXB: { category: "Control and signalling", description: "Durable 22 mm pushbutton for clear machine control and demanding panel environments.", range: "10 A contact", voltage: "Up to 600 V", capacity: "IP66 / IP69K", protection: "Front environmental seal" },
    DMG210: { category: "Digital energy meter", description: "Clear and accurate electrical measurement for modern distribution and energy monitoring systems.", range: "5 A input", voltage: "Multi-voltage", capacity: "LCD display", protection: "Front IP54" },
    DCRL5: { category: "Power factor controller", description: "Five-step automatic power factor correction controller with straightforward setup and monitoring.", range: "5 steps", voltage: "400 V AC", capacity: "Expandable control", protection: "Alarm monitoring" }
  };
  const params = new URLSearchParams(window.location.search);
  const requestedSku = (params.get("sku") || "SM1P0250").toUpperCase();
  const sku = products[requestedSku] ? requestedSku : "SM1P0250";
  const product = products[sku];
  document.querySelectorAll("[data-sku-text]").forEach((node) => node.textContent = sku);
  setText("[data-product-category]", product.category);
  setText("[data-product-description]", product.description);
  document.querySelectorAll("[data-product-range]").forEach((node) => node.textContent = product.range);
  setText("[data-product-voltage]", product.voltage);
  setText("[data-product-capacity]", product.capacity);
  setText("[data-product-protection]", product.protection);
  const quote = document.querySelector("[data-quote-link]");
  const whatsapp = document.querySelector("[data-whatsapp-link]");
  if (quote) quote.href = `contactUs.html?subject=quote&product=${encodeURIComponent(sku)}`;
  if (whatsapp) whatsapp.href = `https://wa.me/962795600703?text=${encodeURIComponent(`Hello, I need information about ${sku}.`)}`;
  document.title = `${sku} | Kareem Swidan`;
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function initGallery(reducedMotion) {
  const mainImage = document.querySelector("[data-main-product-image]");
  const thumbs = [...document.querySelectorAll("[data-gallery-src]")];
  if (!mainImage || !thumbs.length) return;
  thumbs.forEach((button) => button.addEventListener("click", () => {
    const applyImage = () => {
      mainImage.src = button.dataset.gallerySrc || mainImage.src;
      mainImage.alt = button.dataset.galleryAlt || "Product image";
      thumbs.forEach((thumb) => thumb.setAttribute("aria-current", String(thumb === button)));
      mainImage.classList.remove("is-changing");
    };
    if (reducedMotion) applyImage();
    else {
      mainImage.classList.add("is-changing");
      window.setTimeout(applyImage, 160);
    }
  }));
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const subjectSelect = form.querySelector('[name="subject"]');
  const productInput = form.querySelector('[name="product"]');
  const subjectMap = { quote: "Quotation request", product: "Product inquiry", datasheet: "Technical support", dimensions: "Technical support", wiring: "Technical support", support: "Technical support", project: "General inquiry" };
  const requestedSubject = params.get("subject");
  if (subjectSelect && requestedSubject && subjectMap[requestedSubject]) subjectSelect.value = subjectMap[requestedSubject];
  if (productInput && params.get("product")) productInput.value = params.get("product");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const status = form.querySelector("[data-form-status]");
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const company = String(data.get("company") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const subject = String(data.get("subject") || "Inquiry").trim();
    const product = String(data.get("product") || "").trim();
    const message = String(data.get("message") || "").trim();
    const body = [`Name: ${name}`, `Company: ${company || "Not provided"}`, `Email: ${email}`, `Phone: ${phone}`, `Product code: ${product || "Not provided"}`, "", "Message:", message].join("\n");
    const inquiryTitle = product ? `${subject} — ${product}` : subject;
    const whatsappMessage = [inquiryTitle, "", body].join("\n");
    if (status) {
      status.textContent = "WhatsApp is opening with your message ready to send.";
      status.classList.add("is-success");
    }
    window.location.href = `https://wa.me/970598934925?text=${encodeURIComponent(whatsappMessage)}`;
  });
}
