	/**
	 * Determines if specified line number is in the highlighted list.
	 * https://github.com/alexgorbatchev
	 */
	var isLineHighlighted = function(lineNumber)
	{
		var linesToHighlight = this.opts.highlight || [];

		if (typeof(linesToHighlight.push) !== 'function')
			linesToHighlight = [linesToHighlight];

		return linesToHighlight.indexOf(lineNumber.toString()) !== -1;
	}
