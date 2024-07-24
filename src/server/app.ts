import fs from 'fs';
import path from 'path';

import db from './db';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';





const app = new Hono();



app.use('*', cors({
	origin: ['http://localhost:3005/*', 'http://localhost:3007', 'http://localhost:5175', '*'],
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	credentials: true,
}))

app.use('/*', serveStatic({ root: '../statics' }))


const buildQuery = (imei, startDate, endDate) => {
	let query = `
    SELECT 
      *,
      JSON_EXTRACT(msg_geo, "$.heterogenousLookup") AS isHet
    FROM new_het_lookup
  `;
	const conditions = [];
	const params = [];

	if (imei) {
		conditions.push('bee_imei = ?');
		params.push(imei);
	}

	if (startDate) {
		conditions.push('created_date >= ?');
		params.push(parseInt(startDate, 10));
	}

	if (endDate) {
		if (!startDate) {
			throw new Error('End date provided without start date');
		}
		conditions.push('created_date <= ?');
		params.push(parseInt(endDate, 10));
	}

	if (conditions.length > 0) {
		query += ' WHERE ' + conditions.join(' AND ');
	}


	return { query, params };
};

// Get all records
app.get('/heterogenous_lookup', async (c) => {
	const { imei, startDate, endDate, hetOnly } = c.req.query();
	console.log(imei, startDate, endDate, hetOnly);
	const connection = await db.getConnection();
	try {
		if (endDate && !startDate) {
			return c.json({ error: 'End date provided without start date' }, 400);
		}

		let { query, params } = buildQuery(imei, startDate, endDate);

		// If hetOnly is true, add a condition to filter for heterogeneous lookups
		if (hetOnly === 'true') {
			if (query.includes('WHERE')) {
				query += ' AND JSON_EXTRACT(msg_geo, "$.heterogenousLookup") = true';
			} else {
				query += ' WHERE JSON_EXTRACT(msg_geo, "$.heterogenousLookup") = true';
			}
		}

		const [rows] = await connection.query(query, params);

		if (rows.length === 0) {
			return c.json({ message: 'Record not found' }, 404);
		}
		console.log(`Length of rows from sql: ${rows}, ${rows.length}`)

		return c.json({
			message: `data fetched`,
			data: rows
		});
	} catch (err) {
		console.error(err);
		return c.json({ error: 'internal server error' }, 500);
	} finally {
		connection.release();
	}
});
// Get a single record by ID
app.get('/heterogenous_lookup/:id', async (c) => {
	const id = c.req.param('id');
	const connection = await pool.getConnection();
	try {
		const [rows] = await connection.query('SELECT * FROM heterogenous_lookup WHERE id = ?', [id]);
		if (rows.length === 0) {
			return c.json({ message: 'Record not found' }, 404);
		}
		return c.json(rows[0]);
	} finally {
		connection.release();
	}
});

// Create a new record
app.post('/heterogenous_lookup', async (c) => {
	const { data, msg_geo, heterogenous_geo, created_date, bee_imei, msg_uuid, account_id, msg_geo_distance, heterogenous_geo_distance, delta_distance } = await c.req.json();
	const connection = await pool.getConnection();
	try {
		const [result] = await connection.query(
			'INSERT INTO heterogenous_lookup (data, msg_geo, heterogenous_geo, created_date, bee_imei, msg_uuid, account_id, msg_geo_distance, heterogenous_geo_distance, delta_distance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[data, msg_geo, heterogenous_geo, created_date, bee_imei, msg_uuid, account_id, msg_geo_distance, heterogenous_geo_distance, delta_distance]
		);
		return c.json({ id: result.insertId }, 201);
	} finally {
		connection.release();
	}
});

// Update a record by ID
app.put('/heterogenous_lookup/:id', async (c) => {
	const id = c.req.param('id');
	const { data, msg_geo, heterogenous_geo, created_date, bee_imei, msg_uuid, account_id, msg_geo_distance, heterogenous_geo_distance, delta_distance } = await c.req.json();
	const connection = await pool.getConnection();
	try {
		const [result] = await connection.query(
			'UPDATE heterogenous_lookup SET data = ?, msg_geo = ?, heterogenous_geo = ?, created_date = ?, bee_imei = ?, msg_uuid = ?, account_id = ?, msg_geo_distance = ?, heterogenous_geo_distance = ?, delta_distance = ? WHERE id = ?',
			[data, msg_geo, heterogenous_geo, created_date, bee_imei, msg_uuid, account_id, msg_geo_distance, heterogenous_geo_distance, delta_distance, id]
		);
		if (result.affectedRows === 0) {
			return c.json({ message: 'Record not found' }, 404);
		}
		return c.json({ message: 'Record updated' });
	} finally {
		connection.release();
	}
});

// Delete a record by ID
app.delete('/heterogenous_lookup/:id', async (c) => {
	const id = c.req.param('id');
	const connection = await pool.getConnection();
	try {
		const [result] = await connection.query('DELETE FROM heterogenous_lookup WHERE id = ?', [id]);
		if (result.affectedRows === 0) {
			return c.json({ message: 'Record not found' }, 404);
		}
		return c.json({ message: 'Record deleted' });
	} finally {
		connection.release();
	}
});

// Fetch info based on IMEI
app.get('/heterogenous_lookup/imei/:imei', async (c) => {
	const imei = c.req.param('imei');
	const connection = await pool.getConnection();

	const startDate = c.req.query('startDate');
	const endDate = c.req.query('endDate');

	try {
		console.log(`IMEI: ${imei}, Start Date: ${startDate}, End Date: ${endDate}`);
		const queryParams = [imei];
		// let query = 'SELECT * FROM heterogenous_lookup WHERE bee_imei = ? ORDER BY created_date ASC';
		// TODO: remove limit after impl render markers in react map-app
		let query = 'SELECT * FROM new_het_lookup WHERE bee_imei = ? ORDER BY created_date ASC';

		if (startDate !== undefined && endDate !== undefined) {
			query = 'SELECT * FROM new_het_lookup WHERE bee_imei = ? AND created_date BETWEEN ? AND ? ORDER BY created_date ASC';
			queryParams.push(parseInt(startDate), parseInt(endDate));
		}

		const [rows] = await connection.query(query, queryParams);
		if (rows.length === 0) {
			console.log("no rows found")
			return c.json({ message: 'Record not found' }, 404);
		}

		const flattenedData = [];
		const acceptedGeos = [];
		const notGood = [];
		const bad = [];
		const hetGeoMap = {}

		rows.forEach(row => {
			const msgGeo = JSON.parse(row.msg_geo);
			const dataArray = JSON.parse(row.data);
			const hetGeo = JSON.parse(row.heterogenous_geo);

			const distances = {
				delta_distance: JSON.parse(row.delta_distance),
				msg_geo_distance: JSON.parse(row.msg_geo_distance),
				heterogenous_geo_distance: JSON.parse(row.heterogenous_geo_distance)
			}

			const formattedDate = unixToIST(row.created_date);

			// Only perform analysis if heterogenousLookup is true
			row.status = 'good';
			if (msgGeo.heterogenousLookup === true) {
				if (row.delta_distance > 500 && row.delta_distance <= 1000) {
					console.log('in not good')
					row.status = 'not good';
					notGood.push({ ...msgGeo, hetData: dataArray });
				} else if (row.delta_distance > 1000) {
					row.status = 'bad';
					bad.push({ ...msgGeo, hetData: dataArray });
				}
			}

			function unixToIST(unixTime) {
				const istOffset = 5.5;
				const istDate = new Date(unixTime * 1000);
				istDate.setHours(istDate.getHours() + istOffset);
				istDate.setMinutes(istDate.getMinutes() + (istOffset % 1) * 60);
				return istDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
			}

			hetGeoMap[row.created_date] = [JSON.parse(hetGeo.lat), JSON.parse(hetGeo.lng)];

			acceptedGeos.push({
				...msgGeo,
				createdDate: row.created_date,
				status: row.status,
				distances: distances
			});

			dataArray.forEach(item => {
				flattenedData.push({
					...item,
					msg_uuid: row.msg_uuid,
					created_date: row.created_date,
					status: row.status
				});
			});
		});

		// need to write these not good and bad to a file
		// check that the imei folder is created
		if (!fs.existsSync(`./${imei}`)) {
			fs.mkdirSync(`./${imei}`, { recursive: true });
		}
		if (notGood.length !== 0) {
			fs.writeFileSync(`./${imei}/${imei}-het-over-500.json`, JSON.stringify(notGood, null, 2))
		}
		if (bad.length !== 0) {
			fs.writeFileSync(`./${imei}/${imei}-het-over-1000.json`, JSON.stringify(bad, null, 2))
		}

		console.log(hetGeoMap)
		return c.json({
			message: `Data returned for bee_${imei}`,
			mapData: flattenedData,
			geoData: acceptedGeos,
			hetGeoMap: hetGeoMap,
			analysis: {
				notGood: notGood,
				bad: bad
			}
		});
	} catch (err) {
		console.error(err);
		return c.json({ error: 'internal server error' }, 500);
	} finally {
		connection.release();
	}
});

// Start the server
const port = 3007;
serve({ fetch: app.fetch, port: port })
