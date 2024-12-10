"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useSocket } from "../providers/socket-provider";

const formSchema = z.object({
  fileUpload: z.object({
    url: z.string().min(1, { message: "Attachment is required." }),
    type: z.string().min(1),
  }),
});

export const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const isModalOpen = isOpen && type === "messageFile";
  const { query } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUpload: {
        url: "",
        type: "",
      },
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  }

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (socket && isConnected) {
      try {
        const { serverId, channelId, profileId, conversationId, type } = query;

        socket.emit('createMessage', {
          content: values.fileUpload.url,
          fileUrl: values.fileUpload.url,
          fileType: values.fileUpload.type,
          serverId,
          channelId, 
          profileId,
          conversationId,
          type
        });

        form.reset();
        router.refresh();
        handleClose();
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField 
                  control={form.control}
                  name="fileUpload"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload 
                          endpoint="messageFile"
                          value={field.value.url}
                          type={field.value.type}
                          onChange={({ url, type }) => field.onChange({ url, type })}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant="primary" disabled={isLoading}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
