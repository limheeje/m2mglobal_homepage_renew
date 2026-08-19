/*about swiper*/
var aboutSwiper = new Swiper(".aboutus-swiper", {
  slidesPerView: 5,
  spaceBetween: 24,
  autoHeight: true,
  observer: true,
  observeParents: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  mousewheel: true,
  keyboard: true,
  breakpoints: {
     768: {
      slidesPerView: 2
    },
    1200 : {
      slidesPerView: 3
    }
  }
});
/*business - mes swiper*/
var swiper = new Swiper(".mes-swiper", {
  slidesPerView: 3,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  keyboard: true,
  breakpoints: {
    768: {
      slidesPerView: 1
    }
  }
});
var swiper = new Swiper(".agv-swiper", {
  slidesPerView: 3,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  keyboard: true,
  breakpoints: {
    768: {
      slidesPerView: 1
    },
  }
});
/*work swiper*/
var workSwiper = new Swiper(".works-swiper, .works-swiper02", {
  slidesPerView: 2,
  spaceBetween: 24,
  autoHeight: true,
  observer: true,
  observeParents: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  mousewheel: true,
  keyboard: true,
  breakpoints: {
    768 : {
      slidesPerView: 1
    }
  }
});

AOS.init({
  easing: 'ease-out-back',
  duration: 1000
});


$(function() {
  //location
  let ww = $(window).innerWidth();
  $('.location-title').on('click', function (e) {
    console.log('1');
    if($(this).next('.location-link').hasClass('is-on')){
      $(this).next('.location-link').removeClass('is-on');
      $(this).parent().removeClass('on');
    }else {
      if(ww < 768){
        console.log('모');
        $(this).next('.location-link').addClass('is-on');
        $(this).parent().addClass('on');
        $(this).parents().find('ul > li:nth-child(1)').removeClass('on');
      }else {
        console.log('pc');
        $(this).next('.location-link').addClass('is-on');
        $(this).parent().addClass('on');
        
      }
    }
  });
  $('.location-link a').on('click', function (e) {
    const currentLink = $(this).attr('href');
    const currentParams = currentLink.split('#')[1];
    console.log('1' + $('#' + currentParams).offset().top);
    if(currentParams) {
      const headerHeight = $('#header').outerHeight();
      const locationHeight = $('.location').outerHeight();
      $('.gnb > li .sub > li > a').each(function() {
        const allLink = $(this).attr('href');
        console.log('전체링크 :' + allLink);
        if( currentLink === allLink ){
          $(this).parent('li').addClass('on');
          $('.gnb > li').has('.sub > li.on').addClass('on');
        }else {
          $(this).parent('li').removeClass('on');
        }
      });
      $('li:last-child .location-title').text($(this).text());
      if($('.location').hasClass('is-fixed')){
        const topPosition = $('#' + currentParams).offset().top - headerHeight - locationHeight;
        $('html, body').animate({ scrollTop: topPosition},'slow');
      }else {
        const topPosition = $('#' + currentParams).offset().top - headerHeight - locationHeight - locationHeight;
        $('html, body').animate({ scrollTop: topPosition},'slow');
      }
    }
    $('.location-depth').removeClass('on');
    $('.location-link').removeClass('is-on');
  });
  // $('.location-title').parent('li').on('mouseleave', function () {
  //   console.log('leave');
  //   if($(this).next('.location-link').hasClass('is-on')){
  //     $(this).next('.location-link').removeClass('is-on');
  //     $(this).removeClass('on');
  //   }else {
  //     $(this).next('.location-link').removeClass('is-on');
  //     $(this).removeClass('on');
  //   }
  // });
  
  /*이미지태그*/
  $(".image-tag-hover .target.no01").on('mouseover focusin click', function(e){
    if($(".hover-img-area").css("display") == 'none') {
      $(".hover-img-area").fadeIn().css('display', 'flex');
    }else {
      $(".hover-img-area").fadeOut();
    }
  });
  $('.image-tag-hover .target.no01').on('mouseleave', function () {
    $(".hover-img-area").fadeOut();
  });

  // 서비스 이미지 스크롤 영역
  $(window).on("load resize", function(){
    if($('body').hasClass('mobile')){
      $(".scroll .conts-img-inner").mCustomScrollbar({
        axis:"yx", // vertical and horizontal scrollbar
        theme:"dark"
      });
    }else {
      $(".scroll .conts-img-inner").mCustomScrollbar("destroy");
    }
  });
  
});