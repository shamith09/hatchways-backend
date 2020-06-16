/**
 * @author Shamith Pasula
 * @version 6/15/20
 * 
 * This app is for hatchways.io backend assessment.
 * It gets data about blog posts from their API and sorts it based on
 * the query parameters passed.
 */

// imports
const express = require('express');
const axios = require('axios');

// instantiating express
const app = express();

// helper function to send json to res
const send_json = (res, response_json) => {
	res.type('json');
	res.send(JSON.stringify(response_json, null, 4));
}

// ping GET request
// sends json with success: true
app.get('/api/ping', (req, res) => {
	res.status(200);
	const response_json = {
		success: true
	};
	send_json(res, response_json);
});

// posts GET request, handles query params
// sends json with posts that fit query params
app.get('/api/posts', async (req, res) => {
	const tags = req.query.tags.split(',');
	// checking for no tags error
	if (tags.length == 0) {
		res.status(400);
		response_json = {
			error: 'Tags parameter is required'
		};
		send_json(res, response_json);
		return;
	}

	// checking for invalid sortBy param
	const sortBy_options = [
		'id',
		'reads',
		'likes',
		'popularity'
	];
	const sortBy = req.query.sortBy;
	if (sortBy_options.indexOf(sortBy) == -1) {
		if (sortBy == null) {
			sortBy = 'id';
		} else {
			res.status(400);
			response_json = {
				error: 'sortBy parameter is invalid'
			};
			send_json(res, response_json);
			return;
		}
	}

	// checking for invalid directions param
	const direction_options = [
		'asc',
		'desc'
	];
	const direction = req.query.direction;
	if (direction_options.indexOf(direction) == -1) {
		if (direction == null) {
			direction = 'id';
		} else {
			res.status(400);
			response_json = {
				error: 'Direction parameter is invalid'
			};
			send_json(res, response_json);
			return;
		}
	}

	const base_url = 'https://hatchways.io/api/assessment/blog/posts?tag=';
	let data = [];

	// making GET request to retrieve posts data
	for (tag of tags) {
		url = base_url + tag;
		await axios.get(url).then(response => {
			data = data.concat(response.data.posts);
		});
	};

	// sorting data according to query params
	data = data.sort((a, b) => a[sortBy] - b[sortBy]);
	if (direction == 'desc')
		data = data.reverse();

	// send data to res
	res.status(200);
	response_json = {
		posts: data
	}
	send_json(res, response_json);

	// sorting test
	let failed = false;
	for (let i = 0; i < data.length-1; i++) {
		if (direction == 'asc') {
			if (data[i][sortBy] > data[i+1][sortBy]) {
				failed = true;
				break;
			}
		} else {
			if (data[i][sortBy] < data[i+1][sortBy]) {
				failed = true;
				break;
			}
		}
	}
	if (failed)
		console.log('sorting failed');
	else
		console.log('sorting success!');
});

// run on port 3000
app.listen('3000', () => {
	console.log('Running on port 3000');
});