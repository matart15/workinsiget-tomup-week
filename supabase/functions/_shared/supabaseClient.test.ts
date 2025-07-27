import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import {
  returnsNext,
  stub,
} from "https://deno.land/std@0.206.0/testing/mock.ts";

import { _internals, getAuthUserId } from "./supabaseClient.ts";

const { getRequestUser } = _internals;

Deno.test("getRequestUser should return user id", async () => {
  const mockGetSupabaseClient: any = {
    auth: {
      getUser: () => ({
        data: { user: { id: "123" } },
      }),
    },
  };
  // Arrange
  const mockReq = {} as Request;
  const randomIntStub = stub(
    _internals,
    "getSupabaseClient",
    returnsNext([mockGetSupabaseClient]),
  );

  try {
    // Act
    const result = await getRequestUser(mockReq);
    // Assert
    assertEquals(result, "123");
  } finally {
    randomIntStub.restore();
  }
});
Deno.test(
  "getRequestUser should throw an error if no user is found",
  async () => {
    // Arrange
    const mockReq = {} as Request;
    const mockSupabaseClient: any = {
      auth: {
        getUser: () => ({ data: { user: null } }),
      },
    };
    const getSupabaseClientStub = stub(
      _internals,
      "getSupabaseClient",
      returnsNext([mockSupabaseClient]),
    );

    try {
      // Act
      await getRequestUser(mockReq);
      // Assert
      throw new Error("Expected an error to be thrown");
    } catch (error) {
      // Assert
      assertEquals(error.message, "No user found");
    } finally {
      getSupabaseClientStub.restore();
    }
  },
);
Deno.test("getAuthUserId should return user id", async () => {
  const mockReq = {} as Request;
  const mockGetRequestUser = stub(
    _internals,
    "getRequestUser",
    returnsNext(["123" as any]),
  );

  try {
    // Act
    const result = await getAuthUserId(mockReq);
    // Assert
    assertEquals(result, "123");
  } finally {
    mockGetRequestUser.restore();
  }
});

Deno.test(
  "getAuthUserId should throw an error if no user id is found",
  async () => {
    // Arrange
    const mockReq = {} as Request;
    const mockGetRequestUser = stub(
      _internals,
      "getRequestUser",
      returnsNext([null as any]),
    );

    try {
      // Act
      await getAuthUserId(mockReq);
      // Assert
      throw new Error("Expected an error to be thrown");
    } catch (error) {
      // Assert
      assertEquals(error.message, "No user id found");
    } finally {
      mockGetRequestUser.restore();
    }
  },
);
