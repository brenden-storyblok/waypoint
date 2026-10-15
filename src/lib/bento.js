// Bento layout for image galleries. Each image gets a tile shape (columns x
// rows) chosen from its aspect ratio, and the search keeps only layouts that
// fill every row, so the grid has no holes.
//
// The CSS grid places tiles with `grid-auto-flow: dense`. Dense placement puts
// each tile at the first cell where it fits, and the solver places tiles the
// same way, so the spans alone reproduce the solved layout.

// Storyblok adds meta_data.size ("2400x1600") when an editor picks the asset.
export function assetRatio(asset) {
	const match = /^(\d+)x(\d+)$/.exec(asset?.meta_data?.size ?? '');
	if (!match) return 1;
	return Number(match[1]) / Number(match[2]);
}

const orientation = (ratio) => {
	if (ratio < 0.9) return 'portrait';
	if (ratio > 1.1) return 'landscape';
	return 'square';
};

// Shapes each orientation can take, with a cost. The solver picks the layout
// with the lowest total cost. `cols: 'all'` spans the full grid width.
const SHAPES = {
	portrait: [
		{ cols: 1, rows: 2, cost: 0 },
		{ cols: 2, rows: 2, cost: 3 },
		{ cols: 1, rows: 1, cost: 4 },
		{ cols: 'all', rows: 2, cost: 6 },
	],
	landscape: [
		{ cols: 1, rows: 1, cost: 0 },
		{ cols: 2, rows: 2, cost: 1 },
		{ cols: 2, rows: 1, cost: 2 },
		{ cols: 'all', rows: 2, cost: 4 },
	],
	square: [
		{ cols: 1, rows: 1, cost: 0 },
		{ cols: 2, rows: 2, cost: 0.5 },
		{ cols: 'all', rows: 2, cost: 4 },
	],
};

// The solver may pull an image forward by up to LOOKAHEAD - 1 places so a
// portrait can keep its tall tile. Each place moved costs MOVE_COST.
const LOOKAHEAD = 3;
const MOVE_COST = 0.5;

// Large galleries split into chunks so the search stays small. Each chunk
// fills whole rows, so chunks stack without gaps.
const MAX_CHUNK = 8;

// Returns the chunk's items in display order, each with its { cols, rows }.
function solveChunk(items, columns, lookahead) {
	const grid = [];
	const isFree = (r, c) => !grid[r]?.[c];
	const mark = (r, c, w, h, value) => {
		for (let y = r; y < r + h; y++) {
			grid[y] ??= Array(columns).fill(false);
			for (let x = c; x < c + w; x++) grid[y][x] = value;
		}
	};
	const firstFree = () => {
		for (let r = 0; ; r++) {
			for (let c = 0; c < columns; c++) if (isFree(r, c)) return [r, c];
		}
	};
	// Backtracking leaves empty rows at the end of the grid; those are fine.
	const isFull = () =>
		grid.every((row) => row.every(Boolean) || !row.some(Boolean));

	let best = null;
	const placed = [];

	const place = (remaining, cost) => {
		if (best && cost >= best.cost) return;
		if (remaining.length === 0) {
			if (isFull()) best = { cost, placed: [...placed] };
			return;
		}
		const [r, c] = firstFree();
		for (let pick = 0; pick < Math.min(lookahead, remaining.length); pick++) {
			const item = remaining[pick];
			const rest = remaining.filter((_, i) => i !== pick);
			for (const shape of SHAPES[item.kind]) {
				const w = shape.cols === 'all' ? columns : Math.min(shape.cols, columns);
				const h = shape.rows;
				if (c + w > columns) continue;
				let fits = true;
				for (let y = r; y < r + h && fits; y++) {
					for (let x = c; x < c + w && fits; x++) fits = isFree(y, x);
				}
				if (!fits) continue;
				mark(r, c, w, h, true);
				placed.push({ ...item, cols: w, rows: h });
				place(rest, cost + shape.cost + pick * MOVE_COST);
				placed.pop();
				mark(r, c, w, h, false);
			}
		}
	};

	place(items, 0);
	return best?.placed ?? items.map((item) => ({ ...item, cols: 1, rows: 1 }));
}

function solve(items, columns, lookahead) {
	const chunkCount = Math.ceil(items.length / MAX_CHUNK);
	const result = [];
	let start = 0;
	for (let i = 0; i < chunkCount; i++) {
		const size = Math.ceil((items.length - start) / (chunkCount - i));
		result.push(...solveChunk(items.slice(start, start + size), columns, lookahead));
		start += size;
	}
	return result;
}

// Lays out assets for the wide grid (`columns`) and the narrow grid
// (`narrowColumns`). Returns tiles in display order:
// { asset, wide: { cols, rows }, narrow: { cols, rows } }.
// The wide layout may reorder images. The narrow layout keeps the wide order,
// so the DOM order matches the visual order at both widths.
export function bentoLayout(assets, columns = 4, narrowColumns = 2) {
	const items = assets.map((asset) => ({
		asset,
		kind: orientation(assetRatio(asset)),
	}));
	const wide = solve(items, columns, LOOKAHEAD);
	const narrow = solve(wide, narrowColumns, 1);
	return wide.map((tile, i) => ({
		asset: tile.asset,
		wide: { cols: tile.cols, rows: tile.rows },
		narrow: { cols: narrow[i].cols, rows: narrow[i].rows },
	}));
}
