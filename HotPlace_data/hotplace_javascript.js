/*
해야할 것

테이블 적용
DB 중복값 개선
//t1.daumcdn.net/localimg/localimages/07/2018/img/exsearch-ico-search-hover.png

*/
var data_path = "/HotPlace_data/HotPlace_DB_filtered(35-10-20).json"

// (37.2804721840256, 127.11467724252604) 기흥구청
// (37.38279059708606, 127.11882455528438) 분당구청

/* ---------- 카카오맵 생성 ---------- */
var mapContainer = document.getElementById('map_id'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.38279059708606, 127.11882455528438),
        level: 4 // 지도의 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.BOTTOMLEFT);
/* ---------- 카카오맵 생성 ---------- */


/* ---------- 검색 관련 함수 ---------- */
function keysearchPlaces() {
    var inputbox = document.getElementById('keyword')
    var keyword = inputbox.value;
    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        toast_message('키워드를 입력해주세요!')
        return false
    }
    keyword2 = keyword_change(keyword);
    
    // 실제 검색 모듈 시작
    var search_success;
    searched_data = Array.from({length: store_data.length}, () => false);
    inputbox.blur()
    clusterer.clear();
    reply_min = 100;
    reply_max = 0;
    review_min = 100;
    review_max = 0;
    
    clear_kakao_result();
    search_success = search_in_DB(keyword);
    //keyword2로 진행하는 검색은 더 큰범위 검색이기때문에 search_success가 false면 keyword 검색도 false
    if (keyword2 != keyword) {search_success = search_in_DB(keyword2);}
    if (!search_success) {
        search_in_kakao(keyword);
    }
    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    // ps.keywordSearch(keyword, placesSearchCB)
}

function search_in_DB(keyword) {
    var is_in_data;
    var is_in_alldata=false;
    
    for (let index=0; index<store_data.length; index++) {
        is_in_data = false;
        
        // category 검색
        for (jj in store_data[index].category) {
            if (store_data[index].category[jj].indexOf(keyword)!=-1){
                is_in_data = true; is_in_alldata=true; searched_data[index]=true;}
        }
        // 상호명 검색
        if (store_data[index].name.indexOf(keyword)!=-1){
            is_in_data = true; is_in_alldata=true; searched_data[index]=true;}
        
        if (is_in_data){
            clusterer.addMarker(cluster_markers[index]);
            infowindow_set[index].setMap(map);
            // filter min max 값 반환
            data_minmax(index,store_data[index]);
            
        } else {
            infowindow_set[index].setMap(null);
            overlay_set[index].setMap(null);
            marker_onoff[index]=false;
        }
    }
    init_filter();
    
    if (is_in_alldata == true){display_reset();}
    
    return is_in_alldata
}

function search_in_kakao(keyword) {
    var places = new kakao.maps.services.Places(map);
    var options = {useMapCenter:true};
    places.keywordSearch(keyword,kakao_callback,options);
}

function kakao_callback(result, status, pagination){
    switch (status){
        case kakao.maps.services.Status.OK:
            toast_message('검색 결과가 존재하지 않아, <br> 카카오맵 검색 결과를 표시합니다.');
            let bounds = new kakao.maps.LatLngBounds();
            for (let i=0; i<result.length; i++) {
                make_kakao_marker(i,result[i]);
                bounds.extend(new kakao.maps.LatLng(result[i].y, result[i].x));
            }
            map.setBounds(bounds);
            break;
        case kakao.maps.services.Status.ZERO_RESULT:
            toast_message('검색 결과가 존재하지 않습니다.');
            break;
        case kakao.maps.services.Status.ERROR:
            toast_message('검색 중 오류가 발생했습니다.');
            break;
    }
}

function display_reset(){
    if (map.getLevel()<clusterer.getMinLevel()) {map.setLevel(clusterer.getMinLevel(), {animate:true});};
    setTimeout(function(){
        try {map.panTo(clusterer._clusters[0]._center);}
        catch(err) {toast_message('검색 결과가 화면에 없습니다.<br>화면을 확대해서 확인해보세요.');}
    },300);
}

function init_search(){
    toast_message('초기화 중입니다...');
    var keyword = document.getElementById('keyword');
    keyword.value="";
    reply_min = 100;
    reply_max = 0;
    review_min = 100;
    review_max = 0;
    searched_data = Array.from({length: store_data.length}, () => true);
    
    var resettt = function (){
        clusterer.addMarkers(cluster_markers);
        close_all_overlay();
        for (let i=0; i<store_data.length; i++){data_minmax(i,store_data[i]); infowindow_set[i].setMap(map);}
        clusterer.redraw();
        init_filter();
    };
    clear_kakao_result();
    setTimeout(resettt,500);
}

function keyword_change(keyword){
    var changed_word;
    switch (keyword) {
        case "카레":
        case "커리":
            changed_word = "인도음식"
            break;
        case "스시":
            changed_word = "초밥"
            break;
        case "타코":
        case "부리또":
            changed_word = "브라질"
            break;
        case "쌀국수":
            changed_word = "아시아"
            break;
        case "파스타":
            changed_word = "이탈리안"
            break;
        default:
            changed_word = keyword;
            break;
    }
    return changed_word
}
/* ---------- 검색 관련 함수 ---------- */



/* ---------- kakao 검색 결과 표시 관련 함수 ---------- */
var kakao_markers = [];
var kakao_info = [];

function make_kakao_marker(index,data) {
    kakao_markers[index] = new kakao.maps.Marker({
        map:map,
        position: new kakao.maps.LatLng(data.y, data.x),
        title:data.place_name
    });
    
    var info_window = new kakao.maps.CustomOverlay({zIndex:1, xAnchor:0.5, yAnchor:3.1});
    
    var info_content = '<div class="info_window"> (' + data.category_group_name + ')' + data.place_name  + '</div>';
    
    info_window.setContent(info_content);
    info_window.setPosition(new kakao.maps.LatLng(data.y, data.x));
    info_window.setMap(map)
    
    kakao_info[index] = info_window;
}

function clear_kakao_result(){
    if (kakao_markers.length > 0){
        for (i in kakao_markers){
            kakao_markers[i].setMap(null);
            kakao_info[i].setMap(null);
        }
        kakao_markers = [];
        kakao_info = [];
    }
}
/* ---------- kakao 검색 결과 표시 관련 함수 ---------- */



/* ---------- DEBUGing용 함수 ---------- */
function getInfo() {
    var center = map.getCenter(); 
    var level = map.getLevel();
    var mapTypeId = map.getMapTypeId();
    var bounds = map.getBounds();
    var swLatLng = bounds.getSouthWest();
    var neLatLng = bounds.getNorthEast();
    var boundsStr = bounds.toString();
    
    var message = '지도 중심좌표는 위도 ' + center.getLat() + ',\n';
    message += '경도 ' + center.getLng() + ' 이고\n';
    message += '지도 레벨은 ' + level + ' 입니다 \n\n';
    message += '지도 타입은 ' + mapTypeId + ' 이고\n ';
    message += '지도의 남서쪽 좌표는 ' + swLatLng.getLat() + ', ' + swLatLng.getLng() + ' 이고 \n';
    message += '북동쪽 좌표는 ' + neLatLng.getLat() + ', ' + neLatLng.getLng() + ' 입니다';
    console.log(message)
}

/*
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {        
    
    // 클릭한 위도, 경도 정보를 가져옵니다 
    var latlng = mouseEvent.latLng;
    
    var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
    message += '경도는 ' + latlng.getLng() + ' 입니다';
    
    console.log(message)
});*/
/* ---------- DEBUGing용 함수 ---------- */



/* ---------- GPS 관련 함수 ---------- */

var gps_use = null; //gps의 사용가능 여부
var gps_lat = null; // 위도
var gps_lng = null; // 경도
var gps_overlay;


function clickGPS() {
    
    var geo_success = function(position) {
        //hide_toast();
        //clearTimeout(toast_timeout);
        
        gps_lat = position.coords.latitude;
        gps_lng = position.coords.longitude;
        
        if (gps_use) {
            var position = new kakao.maps.LatLng(gps_lat,gps_lng);
            map.panTo(position);
            gps_overlay.setPosition(position);
        } else {
            var position = new kakao.maps.LatLng(gps_lat,gps_lng);
            map.panTo(position);
            var gps_content = '<div><img class="pulse" draggable="false" unselectable="on" src="https://ssl.pstatic.net/static/maps/m/pin_rd.png" alt=""></div>';
            gps_overlay = new kakao.maps.CustomOverlay({
                position: position,
                content: gps_content,
            })
            gps_overlay.setMap(map)
            gps_use = true;
        };
    };
    var geo_error = function(error) {
        switch(error.code) {
            case error.TIMEOUT:
                toast_message('위치 정보를 읽어올 수 없습니다. <br> 다시 시도해 주세요.');
                gps_use = false;
                break;
            case error.PERMISSION_DENIED:
                toast_message('현재 위치를 사용하시려면,<br> 위치 권한을 허용해주세요.');
                gps_use = false;
                break;
            case error.POSITION_UNAVAILABLE:
                toast_message('위치 정보를 얻을 수 없습니다.');
                gps_use = false;
                break;
            case error.UNKNOWN_ERROR:
                toast_message('GPS UNKNOWN_ERROR');
                gps_use = false;
                break;
        };
    };
    var options = {timeout:3000, enableHighAccuracy: true};
    
    navigator.geolocation.getCurrentPosition(geo_success, geo_error, options);
}

/* ---------- GPS 관련 함수 ---------- */



/* ---------- Filter 관련 함수 ---------- */
function init_filter(){
    var reply_r = document.getElementById('reply_range');
    var reply_n = document.getElementById('reply_number');
    var review_r = document.getElementById('review_range');
    var review_n = document.getElementById('review_number');
    
    reply_r.max = reply_max-reply_min;
    reply_r.min = "0";
    reply_r.value = reply_max-reply_min;
    reply_n.max = reply_max;
    reply_n.min = reply_min;
    reply_n.value = reply_min;
    
    review_r.max = review_max-review_min;
    review_r.min = "0";
    review_r.value = review_max-review_min;
    review_n.max = review_max;
    review_n.min = review_min;
    review_n.value = review_min;
}

function click_filter() {
    var filter_class = document.getElementsByClassName("filter_detail");
    filter_class[0].classList.toggle("filter_on");
}

function apply_filter() {
    var star_n = document.getElementById('star_number');
    var reply_n = document.getElementById('reply_number');
    var review_n = document.getElementById('review_number');
    
    if (star_n.value>5.0 || star_n.value<3.5){toast_message('별점 필터값을 수정해주세요'); return false;}
    if (reply_n.value>reply_max || reply_n.value<reply_min){toast_message('댓글 필터값을 수정해주세요'); return false;}
    if (review_n.value>review_max || review_n.value<review_min){toast_message('리뷰 필터값을 수정해주세요'); return false;}
    
    clusterer.clear();
    close_all_overlay();
    var count =0;
    for (let i=0; i<store_data.length; i++){
        if ((searched_data[i]==true) && (store_data[i].star>=star_n.value) && (store_data[i].reply>=reply_n.value) && (store_data[i].review>=review_n.value)){
            clusterer.addMarker(cluster_markers[i]);
            infowindow_set[i].setMap(map);
            count++;
        } else {
            infowindow_set[i].setMap(null);
        }
    }
    if (count==0){toast_message('결과 값이 없습니다.<br>필터 값을 수정해주세요.')}
    else {display_reset();}
}

function star_width(){
    var star_r = document.getElementById('star_range');
    var star_n = document.getElementById('star_number');
    var star_width = document.getElementById('star_sign')
    
    var width = 82-star_r.value*16.4
    star_width.style.width = width+'px';
    
    if (star_n.value>5.0){star_n.value=5.0;}
    if (star_n.value<3.5){star_n.value=3.5;}
}

function filter_number(){
    var reply_n = document.getElementById('reply_number');
    var review_n = document.getElementById('review_number');
    
    if (reply_n.value>reply_max){reply_n.value=reply_max;}
    if (reply_n.value<0){reply_n.value=reply_min;}
    if (review_n.value>review_max){review_n.value=review_max;}
    if (review_n.value<0){review_n.value=review_min;}
}

/* ---------- Filter 관련 함수 ---------- */




/* ---------- close overlay 관련 함수 ---------- */
function close_overlay(index) {
    overlay_set[index].setMap(null);
    marker_onoff[index]=false;
}

function close_all_overlay() {
    for (let i=0; i<store_data.length; i++) {
        close_overlay(i);
    }
}
/* ---------- close overlay 관련 함수 ---------- */




/* ---------- Marker Cluster 및 Overlay 관련 함수 ---------- */
// 마커 클러스터러를 생성합니다
var clusterer = new kakao.maps.MarkerClusterer({
    map: map,
    averageCenter: true,
    minLevel: 4,
    disableClickZoom: true
});


var store_data;
var cluster_markers = [];
var overlay_set = [];
var infowindow_set = [];
var temp_overlay = [];
var marker_onoff = [];
var searched_data = [];
var reply_min = 100;
var reply_max = 0;
var review_min = 100;
var review_max = 0;
/*
배열 한번에 초기화
var arr = Array.from({length: 5}, () => 0);
*/

// HotPlace 데이터 로드
loadJSON(data_path,function(data) {
    store_data=data;
    make_cluster_marker(data);
    }, function(xhr) {console.error(xhr)}
);


function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function make_cluster_marker(data) {
    // marker와 overlay 생성
    reply_min = 100;
    reply_max = 0;
    review_min = 100;
    review_max = 0;
    
    for (i in data) {
        cluster_markers[i] = new kakao.maps.Marker({
            position : new kakao.maps.LatLng(data[i].lat, data[i].lng),
            title : data[i].name
        });
        (function (i,data){make_overlay(i,data)})(i,data[i]);
        (function (marker,i,data){make_infowindow(marker,i,data)})(cluster_markers[i],i,data[i]);
        marker_onoff[i]=false;
        searched_data[i]=true;
        
        data_minmax(i,data[i]);
    };
    init_filter();
    
    // overlay 클릭 이벤트 생성
    for (i in data) {
        (function (i,marker,overlay) {
            kakao.maps.event.addListener(marker, 'click', function() {
                // console.log(i)
                if (marker_onoff[i]==false){overlay.setMap(map); marker_onoff[i]=true;}
                else if (marker_onoff[i]==true){overlay.setMap(null); marker_onoff[i]=false;}
            });
            kakao.maps.event.addListener(overlay, 'dragestart', kakao.maps.event.preventMap);
        })(i,cluster_markers[i], overlay_set[i]);
    };
    clusterer.addMarkers(cluster_markers);
}

function make_overlay(i,data) {
    
    var overlay = new kakao.maps.CustomOverlay({zIndex:2, xAnchor:0.5, yAnchor:1.3});
    
    var content = '<div class="overlay_info">';
        content += '    <div id="store_name"><a href="'+ data.url +'"target="inner_iframe" onclick="show_inner_frame()"><strong>'+ data.name +'</strong></a></div>';
        content += '    <div id="overlay_close" onclick="close_overlay('+i+')"></div>';
        content += '    <div id="store_assessment">';
        content += '        <span id="assessment">';
        content += '            <span id="tvshow">'+ data.tvshow +'</span>  <span id="type">'+ data.type +'</span> 리뷰 : '+ data.review +'명 <br>';
        content += '            <span id="star">⭐</span> (평가) : <span id="star">'+ data.star +'점</span> ('+ data.reply +')';
        content += '        </span>';
        content += '    </div>';
        content += '</div>';
    
    overlay.setContent(content);
    overlay.setPosition(new kakao.maps.LatLng(data.lat, data.lng));
    
    overlay_set[i] = overlay;
}


function make_infowindow(marker,i,data){
    var info_window = new kakao.maps.CustomOverlay({zIndex:1, xAnchor:0.5, yAnchor:2.1});
    
    var info_content = '<div class="info_window">';
        info_content += data.type + '<br> <span id="star"><b>☆ ' + data.star + '</b></span></div>';
    
    info_window.setContent(info_content);
    info_window.setPosition(new kakao.maps.LatLng(data.lat, data.lng));
    
    //info_window.setMap(map);
    
    infowindow_set[i] = info_window;
}

function data_minmax(i, data){
    if (data.reply >= reply_max) {reply_max = data.reply; }
    if (data.reply < reply_min) {reply_min = data.reply; }
    if (data.review >= review_max) {review_max = data.review; }
    if (data.review < review_min) {review_min = data.review; }
}
/* ---------- Marker Cluster 및 Overlay 관련 함수 ---------- */



/* ---------- Event 관련 함수 ---------- */
// 마커 클러스터러 클릭이벤트
kakao.maps.event.addListener(clusterer, 'clusterclick', function(cluster) {
    var level = map.getLevel()-2;
    map.setLevel(level, {anchor: cluster.getCenter(), animate:true});
    var cluster_center = new kakao.maps.LatLng(cluster.getCenter().Ma, cluster.getCenter().La);
    map.setCenter(cluster_center);
});

// Zoom이 변경될 때 cluster가 작동하면 Overlay, info window를 없앱니다.
kakao.maps.event.addListener(clusterer, 'clustered', function(){
    
    if (map.getLevel()>=clusterer.getMinLevel()) {
        for (let i=0; i<clusterer._clusters.length; i++){
            if (clusterer._clusters[i]._markers.length != 1){
                
                for (j in clusterer._clusters[i]._markers){
                    var index = cluster_markers.indexOf(clusterer._clusters[i]._markers[j])
                    infowindow_set[index].setMap(null);
                    if (marker_onoff[index]==true && temp_overlay[index]==false){
                        overlay_set[index].setMap(null);
                        temp_overlay[index]=true;
                    } else if (marker_onoff[index]==false){temp_overlay[index]=false;}
                }
            } else if (clusterer._clusters[i]._markers.length == 1){
                index = cluster_markers.indexOf(clusterer._clusters[i]._markers[0])
                infowindow_set[index].setMap(map);
                if (marker_onoff[index]==true && temp_overlay[index]==true){
                    overlay_set[index].setMap(map);
                    temp_overlay[index]=false;
                } else if (marker_onoff[index]==false){temp_overlay[index]=false;}
            }
        }
    } else {for (i in store_data) {temp_overlay[i]=false;}}
});

// zoom이 변경될 때 info window를 표시합니다.
kakao.maps.event.addListener(map, 'zoom_changed', function(){

    if (map.getLevel()<clusterer.getMinLevel()){
        for (let i=0; i<store_data.length; i++){
            if (clusterer._markers.indexOf(cluster_markers[i])!=-1){infowindow_set[i].setMap(map);}
            if (marker_onoff[i]==true && temp_overlay[i]==true){
                overlay_set[i].setMap(map);
                temp_overlay[i]=false;
            }
        }
    }
});

// 클릭 시 Debug 이벤트
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    // input box focus 해제
    var inputbox = document.getElementById('keyword');
    var star_n = document.getElementById('star_number');
    var reply_n = document.getElementById('reply_number');
    var review_n = document.getElementById('review_number');
    inputbox.blur();
    star_n.blur();
    reply_n.blur();
    review_n.blur();
    
    /*
    // 클릭한 위도, 경도 정보를 가져옵니다 
    var latlng = mouseEvent.latLng;
    
    var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
    message += '경도는 ' + latlng.getLng() + ' 입니다';
    
    console.log(message)*/
});
/* ---------- Event 관련 함수 ---------- */



/* ---------- iframe 요소 ---------- */
function show_inner_frame(){
    var newframe = document.getElementById('new_frame');
    newframe.classList.add('frame_on');
}

function close_inner_frame(){
    var newframe = document.getElementById('new_frame');
    var iframe = document.getElementById('inner_frame');
    
    iframe.src="about:blank"
    newframe.classList.remove('frame_on');
}
/* ---------- iframe 요소 ---------- */



/* ---------- toast message 관련 ---------- */
function toast_message(message){
    var toast_class = document.getElementsByClassName("toast");
    toast_class[0].innerHTML = message;
    toast_class[0].classList.add("toast_on");
    var remove_toast = function (){toast_class[0].classList.remove("toast_on");};
    setTimeout(remove_toast,3000);
}
/* ---------- toast message 관련 ---------- */
