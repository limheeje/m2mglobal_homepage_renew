$(document).ready(function () {
    $.fn.extend({
        include: function (src) {
            this.each(function () {
                var container = $(this);
                var pageSrc = src;

                $.get(pageSrc, function (data) {
                    container.html(data);
                });
            });
            return this;
        }
    });

    $(document).ready(function () {
        // 각각의 영역에 경로 확인 후 적용, 필요시 인클루드 파일은 계속 추가 가능
        const url = window.location.pathname.split('/');
        //const urlCurent = $.inArray('index.html',url);
        //const urlCurent = url[2];
        if(url.includes('index.html')){
            $('#header').include('./index_header.html');
            //$('#footer-box').include('./index_footer.html');
        }else {
            $('#header').include('../header.html');
            $('#footer').include('../footer.html');
        }
        // if(urlCurent == 'index.html'){
        //     $('#header').include('./index_header.html');
        //     $('#footer-box').include('./index_footer.html');
        // }else {
        //     $('#header').include('../header.html');
        //     $('#footer').include('../footer.html');
        // }
    });
});