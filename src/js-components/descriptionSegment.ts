'use strict';

import Config from "../config";
import Utils from "../utils";
const utils = new Utils();

/**
 * A Description Segment is a chunk of a text description that can be removed.  
 */
export class DescriptionSegment {

	/**
	 * Whether this segment has been submitted to server or was received from server
	 */
	private submitted:boolean;

	/**
	 * Rather than simply storing the string to be redacted, a set of parameters to locate
	 * the string is stored instead.  This prevents the server from needing to store the
	 * exact string, which may be beneficial for better respecting creator's copyrights
	 * and also allowing a creator to update the description elsewhere without invalidating 
	 * the redacted text.
	 */
	private firstCharacters:string;
	private lastCharacters:string;
	private hash:string;
	private length:number;
	private originalText:string; // only present if user added during this page load (server does not store)

	public static readonly MAX_SURROUNDING_CHARACTERS_TO_CAPTURE:number = 5;

	private constructor()
	{

	}

	public static createSegmentLocally(highlightedString:string):DescriptionSegment
	{
		if (highlightedString.length < 3)
			return null; // It will not be practical to capture/match against such a short string

		let descriptionSegment = new DescriptionSegment();

		if (highlightedString.length <= DescriptionSegment.MAX_SURROUNDING_CHARACTERS_TO_CAPTURE)		
		{
			// Shorter than max, so capture whole string
			descriptionSegment.firstCharacters = highlightedString; 
			descriptionSegment.lastCharacters = highlightedString; 
		} else {
			// Just grab a short snippet
			descriptionSegment.firstCharacters = highlightedString.substring(0, this.MAX_SURROUNDING_CHARACTERS_TO_CAPTURE);
			descriptionSegment.lastCharacters = highlightedString.substring(highlightedString.length - this.MAX_SURROUNDING_CHARACTERS_TO_CAPTURE);
		}

		descriptionSegment.hash = "TODO";

		descriptionSegment.length = highlightedString.length;

		descriptionSegment.submitted = false;
		descriptionSegment.originalText = highlightedString;

		return descriptionSegment;
	}

	public static createSegmentFromServer(firstCharacters:string, lastCharacters:string, hash:string, length:number):DescriptionSegment
	{
		let descriptionSegment = new DescriptionSegment();
		descriptionSegment.firstCharacters = firstCharacters;
		descriptionSegment.lastCharacters = lastCharacters;
		descriptionSegment.hash = hash;
		descriptionSegment.length = length;

		descriptionSegment.submitted = true;

		return descriptionSegment;
	}

	/**
	 * Redact this segment from the given input string.  
	 * @param input String to redact this description segment from.
	 * @returns string Redacted string.  If no match, returns the same as input.
	 */
	public redact(input:string):string
	{
		let i:number = 0;
		while (i+this.length <= input.length)
		{
			let compareFirstCharacters:string = input.substring(i, i+this.firstCharacters.length);
			//console.debug("SBDESCRIPTION: Compare first characters: [" + compareFirstCharacters + "] VS [" + this.firstCharacters + "]");
			if (compareFirstCharacters == this.firstCharacters)
			{
				// Is matching based on first characters
				console.debug("SBDESCRIPTION: First char match!");

				let compareLastCharacters:string = input.substring(i+this.length-this.lastCharacters.length, i+this.length);
				console.debug("SBDESCRIPTION: Compare last characters: [" + compareLastCharacters + "] VS [" + this.lastCharacters + "]");
				if (compareLastCharacters == this.lastCharacters)
				{
					// Is matching based on last characters
					console.debug("SBDESCRIPTION: Last char match!");

					if (true) // TODO Check hash
					{
						// Hash is matching

						// Redact this chunk of the description
						// The naive method would be:
						// return input.substring(0, i) + input.substring(i+this.length);
						// However, this would result in random bits of whitespace in the description.
						
						// So also search backwards and grab any preceeding whitespace
						let startRedactionPosition:number = i;
						while (startRedactionPosition > 0 && (input[startRedactionPosition] == ' ' || input[startRedactionPosition] == '\n'))
							startRedactionPosition--;

						// Also search forwards and grab any trailing whitespace
						let stopRedactionPosition:number = i+this.length;
						while (stopRedactionPosition<input.length-1 && (input[stopRedactionPosition] == ' ' || input[stopRedactionPosition] == '\n'))
							stopRedactionPosition++;

						// Now build the redacted text by returning everything but the redacted portion
						let redactedText:string = input.substring(0, startRedactionPosition);
						if (stopRedactionPosition < input.length)
							redactedText += input.substring(stopRedactionPosition)

						return redactedText;
					}
				}
			}
			i++;
		}

		return input;
	}

	public getFirstCharacters():string
	{
		return this.firstCharacters;
	}

	public getLastCharacters():string
	{
		return this.lastCharacters;
	}

	public getHash():string
	{
		return this.hash;
	}

	public getLength():number
	{
		return this.length;
	}

	/**
	 * Gets text that can be shown in the tools tab.  Note it won't necessarily be the full string,
	 * as server does not store it.
	 */
	public getUserReadableText():string
	{
		if (this.originalText == null)
		{
			// Original text is no longer available, so display what is available:
			let limitedText:string = this.firstCharacters;
			for (let i:number = this.firstCharacters.length; i < this.length - this.firstCharacters.length - this.lastCharacters.length; i++)
				limitedText += ".";
			limitedText += this.lastCharacters;
			return limitedText;
		}
		else
			return this.originalText;
	}
}