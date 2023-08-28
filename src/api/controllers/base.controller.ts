/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Model, Document, Types} from "mongoose";
import {IBaseController} from "./Ibase.controller";
import {Response, Request} from "express";

export default abstract class BaseController implements IBaseController {
  protected _model: Model<Document | any>;

  constructor(model: Model<Document | any>) {
    this._model = model;
  }

  public async list(req: Request, res: Response): Promise<any> {
    const page: number = parseInt(<string>req.query.p) || 1;
    const size: number = parseInt(<string>req.query.s) || 0;
    const order:
      | string
      | { [key: string]: 1 | -1 | { $meta: 'textScore' } }
      | [string, 1 | -1][]
      | null
      | undefined = <string>req.query.o || {};
    const filterBase64: string = <string>req.query.f;

    if (req.params.id) {
      try {
        const model = await this._model.findById(req.params.id).exec();
        if (!model) {
          return res.status(404).send('Model not found');
        }

        if (model?.images) {
          model.images = this.sortImagesBySequence(model.images);
        }

        return res.send(model);
      } catch (error) {
        return res.status(500).send(error);
      }
    } else {
      let filter;

      if (filterBase64) {
        const buffer = Buffer.from(filterBase64, 'base64');
        filter = JSON.parse(buffer.toString('ascii'));

        if (filter.regex) {
          for (const element of filter.regex) {
            if (element === 'regex') return;
            const re = new RegExp(filter[element], 'i');
            filter[element] = re;
          }
          delete filter.regex;
        }

        if (filter.id) {
          for (const element of filter.id) {
            if (element === 'id') return;
            const id = new Types.ObjectId(filter[element]);
            filter[element] = id;
          }
          delete filter.id;
        }
      }

      if (res.locals.vesselType) {
        if (filter) {
          filter.vesselType = res.locals.vesselType;
          filter.vesselStatus = 'PUBLISHED';
        } else {
          filter = {
            vesselType: res.locals.vesselType,
            vesselStatus: 'PUBLISHED',
          };
        }
      }

      try {
        const model = await this._model
          .find(filter)
          .skip(size * (page - 1))
          .limit(size)
          .sort(order)
          .exec();

        // TODO: Find an alternative method for sorting images for the list of vessels
        // model.forEach(data => {
        //     // @ts-ignore
        //     if (data?.images) {
        //         // @ts-ignore
        //         data.images = this.sortImagesBySequence(data.images);
        //     }
        // });

        return res.json(model);
      } catch (error) {
        return res.status(500).send(error);
      }
    }
  }

  public add(req: Request, res: Response): void {
    const newModel = new this._model(req.body);
    newModel.save((err: any, model: Document) => {
      if (err) return res.status(500).send(err);
      return res.json(model);
    });
  }

  public update(req: Request, res: Response): any {
    const id = req.params.id;

    if (!id) {
      return res
        .status(500)
        .send({ success: false, message: 'Id is required' });
    }

    this._model
      .findOneAndUpdate({ _id: id }, req.body, { new: true })
      .then((model: any) => {
        return res.json(model);
      })
      .catch((err: any) => {
        return res.status(500).send(err);
      });
  }

  public delete(req: Request, res: Response): void {
    const id = req.params.id;
    if (id) {
      this._model.findByIdAndDelete(
        {
          _id: id,
        },
        // @ts-ignore
        (err, model) => {
          if (err) return res.status(500).send(err);
          return res.json(model);
        }
      );
    } else {
      res.status(500).send({ success: false, message: 'Id is required' });
    }
  }

  /**
   * Sort the array by the sequence variable
   * @param {any[]} imagesArray - Array to sort
   * @return {any[]} sorted images array
   * */
  public sortImagesBySequence(
    imagesArray: {
      _id: string;
      imageURL: string;
      caption: string;
      sequence?: string;
    }[]
  ) {
    if (imagesArray && imagesArray.length !== 0) {
      imagesArray.sort((a: any, b: any) => {
        return (
          (a?.sequence ? a.sequence : 'Infinity') -
          (b?.sequence ? b.sequence : 'Infinity')
        );
      });
      return imagesArray;
    }
    return [];
  }
}
