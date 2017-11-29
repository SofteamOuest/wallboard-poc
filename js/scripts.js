(function () {
	'use strict';

	const MOCK_URLS = [
		'http://www.meteofrance.com/previsions-meteo-france/nantes/44000',
		'<iframe src="https://calendar.google.com/calendar/embed?mode=AGENDA&amp;height=480&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=startech.ouest%40gmail.com&amp;color=%23333333&amp;ctz=Europe%2FParis" style="border-width:0" width="640" height="480" frameborder="0" scrolling="no"></iframe>',
		'<a class="twitter-timeline" href="https://twitter.com/SofteamGroup?ref_src=twsrc%5Etfw">Tweets by SofteamGroup</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
		'http://www.destineo.fr/fr/schedule/result/?schedule%5Bstop_area%5D%5Bautocomplete%5D=Ile+de+Nantes+%28Nantes%29&schedule%5Bstop_area%5D%5Bautocomplete-hidden%5D=stop_area%3ANAN%3ASA%3AIDNA&schedule%5Bfrom_datetime%5D%5Bdate%5D=29%2F11%2F2017&schedule%5Bfrom_datetime%5D%5Btime%5D%5Bhour%5D=12&schedule%5Bfrom_datetime%5D%5Btime%5D%5Bminute%5D=5'
	];

	const TIMEOUT = 5 * 1000;
	
    window.addEventListener("load", start);
	
	function start() {
		new WidgetListService().getList().then(
			widgetList => new Looper(widgetList, new Wallboard()).start()
		);
	}

	class WidgetListService {
		getList() {
			return new Promise((resolve, _) => resolve(new WidgetList(MOCK_URLS))); 
		}
	}

	class WidgetList {
		constructor(contentList) {
			this.contentList = contentList;
			this.current = 0;
		}

		getNext() {
			let url = this.contentList[this.current];
			this.current = (this.current + 1) % this.contentList.length;
			return url;
		}
	}

	class Wallboard {
		show(content) {
			this.initView()
				.then(() => this.showInView(content))
				.catch(err => this.errorMessage(err));
		}

		initView() {
			return new Promise((resolve, _) => {
				this.view = this.findMainElement();
				this.cleanUp();
				resolve();
			}); 
		}

		findMainElement() {
			var list = document.getElementsByTagName("main");
			return list[0]; 
		}

		cleanUp() {
			while (this.view.hasChildNodes()) {  
				this.view.removeChild(this.view.firstChild);
			}
		}

		showInView(content) {
			var iframe = document.createElement("iframe");
			if (content.substring(0, 4) === 'http') {
				iframe.src = content;
			} else {
				iframe.srcdoc = `<link rel="stylesheet" href="css/content.css?v=1.0" />${content}`;
			}
			this.view.appendChild(iframe);
		}

		errorMessage(err) {
			console.debug("Could not init wallboard view (popup blocker ? security issue with url ?)");
			console.error(err);
		}
	}

	class Looper {
		constructor(widgetList, wallboard) {
			this.timeout = TIMEOUT;
			this.widgetList = widgetList;
			this.wallboard = wallboard;
		}

		start() {
			this.showNext();
			setInterval(() => this.showNext(), this.timeout)
		}

		showNext() {
			this.wallboard.show(this.widgetList.getNext());
		}
	}
})();
