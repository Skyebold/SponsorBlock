'use strict';

import Config from "../config";
import Utils from "../utils";
import { DescriptionSegment } from "./descriptionSegment";
const utils = new Utils();

/**
 * Collection of Description Segments for the video on this page.
 */
export class DescriptionSegmentManager {

	// Singleton pattern
	private static _instance:DescriptionSegmentManager;
	public static get instance() : DescriptionSegmentManager {
		if (DescriptionSegmentManager._instance == null)
			DescriptionSegmentManager._instance = new DescriptionSegmentManager();
		return DescriptionSegmentManager._instance;
	}

	private descriptionSegmentList:Array<DescriptionSegment> = new Array<DescriptionSegment>();

	public addSegment(descriptionSegment:DescriptionSegment):void
	{
		// TODO check for duplicate first
		this.descriptionSegmentList.push(descriptionSegment);
	}

	public removeSegment(descriptionSegment:DescriptionSegment):void
	{
		this.descriptionSegmentList.filter(test => test != descriptionSegment);
	}

	public getList():Array<DescriptionSegment>
	{
		return this.descriptionSegmentList;
	}
}