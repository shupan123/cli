define(function(require) {
	return {
	    'jquery': 'libs/jquery-1.8.3',
	    'lodash': 'libs/lodash',
	    'd3':{
	        src:'libs/d3'
	    },
	    'jquery.pubsub': {
	        src: 'libs/jquery.tinypubsub',
	        deps: ['jquery']
	    }
	}
})